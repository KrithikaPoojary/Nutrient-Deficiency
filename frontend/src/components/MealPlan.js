import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import "./MealPlan.css";

function MealPlan({

  recommendations

}) {

  const navigate = useNavigate();

  // =====================================
  // AUTO SCROLL TOP
  // =====================================

  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  // =====================================
  // MEAL ORDER
  // =====================================

  const mealOrder = [

    "Breakfast",
    "Lunch",
    "Dinner"

  ];

  return (

    <div className="mealplan-page">

      <div className="mealplan-container">

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div className="mealplan-header">

          <h1>

            🥗 3-Day Personalized Meal Plan

          </h1>

          <p>

            AI Generated Nutritional
            Recovery Diet Plan

          </p>

        </div>

        {/* ===================================== */}
        {/* ALL NUTRIENTS */}
        {/* ===================================== */}

        {

          Object.entries(
            recommendations || {}
          ).map(

            ([nutrient, rec]) => (

              rec?.plan && (

                <div

                  className="nutrient-plan-card"

                  key={nutrient}

                >

                  <h2>

                    {nutrient}

                    {" "}
                    Recovery Plan

                  </h2>

                  {/* ===================================== */}
                  {/* DAYS */}
                  {/* ===================================== */}

                  <div className="days-grid">

                    {

                      Object.entries(
                        rec.plan
                      ).map(

                        ([day, meals]) => (

                          <div

                            className="day-card"

                            key={day}

                          >

                            <div className="day-title">

                              {day}

                            </div>

                            {

                              mealOrder.map(

                                (meal) => {

                                  const foods =
                                    meals?.[meal];

                                  return (

                                    foods && (

                                      <div

                                        key={meal}

                                        className="meal-box"

                                      >

                                        <h3>

                                          {meal}

                                        </h3>

                                        <ul>

                                          {

                                            foods.map(

                                              (
                                                food,
                                                index
                                              ) => (

                                                <li
                                                  key={index}
                                                >

                                                  {food}

                                                </li>

                                              )

                                            )

                                          }

                                        </ul>

                                      </div>

                                    )

                                  );
                                }

                              )

                            }

                          </div>

                        )

                      )

                    }

                  </div>

                </div>

              )

            )

          )

        }

        {/* ===================================== */}
        {/* BACK BUTTON */}
        {/* ===================================== */}

        <div className="mealplan-btn-wrap">

          <button

            className="back-btn"

            onClick={() =>
              navigate("/result")
            }

          >

            ← Back To Results

          </button>

        </div>

      </div>

    </div>

  );
}

export default MealPlan;