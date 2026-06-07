import tensorflow as tf
import numpy as np
import cv2
import os


def generate_gradcam(model, image_array, save_path):
    """
    Generate a Grad-CAM heatmap overlaid on the original image.

    Supports both:
      - tf.keras.Model objects  (preferred — gradients work natively)
      - SavedModel loaded via tf.saved_model.load()

    Args:
        model       : Keras model or SavedModel object
        image_array : np.ndarray of shape (1, H, W, 3), float32, values in [0, 1]
        save_path   : Absolute path where the output .jpg will be written

    Returns:
        save_path on success, None on failure.
    """

    try:
        # ── 0. Ensure output directory exists ────────────────────────────────
        os.makedirs(os.path.dirname(save_path), exist_ok=True)

        image_array = image_array.astype(np.float32)

        # ── 1. Obtain the last conv layer & build a sub-model ─────────────────
        #       Works for Keras models; falls back to input-gradient saliency
        #       for SavedModels that expose no layer API.
        use_keras = isinstance(model, tf.keras.Model)

        if use_keras:
            # Find the last Conv2D layer automatically
            last_conv_layer = None
            for layer in reversed(model.layers):
                if isinstance(layer, tf.keras.layers.Conv2D):
                    last_conv_layer = layer
                    break

            if last_conv_layer is None:
                print("GRADCAM WARNING: No Conv2D layer found — using input-gradient saliency.")
                use_keras = False
            else:
                # Sub-model: inputs → [conv_output, final_predictions]
                grad_model = tf.keras.Model(
                    inputs=model.inputs,
                    outputs=[last_conv_layer.output, model.output]
                )

        # ── 2. Compute gradients ──────────────────────────────────────────────
        image_tensor = tf.cast(image_array, tf.float32)

        if use_keras:
            # --- Keras path: gradients w.r.t. last conv feature map ----------
            with tf.GradientTape() as tape:
                tape.watch(image_tensor)
                conv_outputs, predictions = grad_model(image_tensor, training=False)
                class_idx = tf.argmax(predictions[0])
                loss = predictions[:, class_idx]

            grads = tape.gradient(loss, conv_outputs)          # (1, h, w, C)

            # Pool gradients over spatial dims → importance weights per channel
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))  # (C,)

            conv_outputs = conv_outputs[0]                         # (h, w, C)

            # Weighted combination of feature maps
            heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # (h, w, 1)
            heatmap = tf.squeeze(heatmap)                            # (h, w)

        else:
            # --- SavedModel / fallback: input-gradient saliency ---------------
            infer = model.signatures["serving_default"]
            image_tensor_var = tf.Variable(image_array, dtype=tf.float32)

            with tf.GradientTape() as tape:
                tape.watch(image_tensor_var)
                preds = infer(image_tensor_var)
                output = list(preds.values())[0]
                class_idx = tf.argmax(output[0])
                loss = output[:, class_idx]

            grads = tape.gradient(loss, image_tensor_var)  # (1, H, W, 3)
            heatmap = tf.reduce_mean(tf.abs(grads), axis=-1)[0]  # (H, W)

        # ── 3. Normalise heatmap ──────────────────────────────────────────────
        heatmap = heatmap.numpy()
        heatmap = np.maximum(heatmap, 0)               # ReLU

        max_val = np.max(heatmap)
        if max_val > 0:
            heatmap /= max_val

        # ── 4. Resize to original image size ─────────────────────────────────
        orig_h, orig_w = image_array.shape[1], image_array.shape[2]
        heatmap_resized = cv2.resize(heatmap, (orig_w, orig_h))

        # ── 5. Convert to colour map ──────────────────────────────────────────
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)  # BGR

        # ── 6. Overlay on original image ──────────────────────────────────────
        # Convert original image from float [0,1] RGB → uint8 BGR for OpenCV
        orig_img = np.uint8(255 * image_array[0])          # (H, W, 3) RGB
        orig_bgr = cv2.cvtColor(orig_img, cv2.COLOR_RGB2BGR)

        superimposed = cv2.addWeighted(orig_bgr, 0.55, heatmap_color, 0.45, 0)

        # ── 7. Save ───────────────────────────────────────────────────────────
        success = cv2.imwrite(save_path, superimposed)
        if not success:
            print(f"GRADCAM ERROR: cv2.imwrite failed for path: {save_path}")
            return None

        print(f"GRADCAM OK: saved → {save_path}")
        return save_path

    except Exception as e:
        import traceback
        print(f"GRADCAM ERROR: {e}")
        traceback.print_exc()
        return None