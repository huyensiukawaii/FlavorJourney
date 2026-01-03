import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AIGenerator from "../../components/ai/AIGenerator";
import "./DishDetail.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function DishDetail({ dishId, onBack }) {
  const { t, i18n } = useTranslation("dishDetail");
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch dish details
  useEffect(() => {
    if (!dishId) return;

    const fetchDish = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          "x-lang": i18n.language || "vi"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Fetch dish details
        const dishRes = await fetch(`${API_BASE}/dishes/${dishId}`, { headers });
        
        if (!dishRes.ok) {
          if (dishRes.status === 404) {
            throw new Error(t("not_found"));
          }
          throw new Error(t("error"));
        }

        const dishData = await dishRes.json();
        setDish(dishData);

        // Save view history
        if (token) {
          try {
            await fetch(`${API_BASE}/view-history`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ dish_id: dishId })
            });
          } catch (err) {
            console.error("Error saving view history:", err);
          }
        }

        // Check if favorite
        if (token) {
          try {
            const favoriteCheckRes = await fetch(`${API_BASE}/favorites/check/${dishId}`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (favoriteCheckRes.ok) {
              const favoriteData = await favoriteCheckRes.json();
              setIsFavorite(favoriteData.is_favorite || false);
            }
          } catch (err) {
            console.error("Error checking favorite:", err);
          }
        }
      } catch (err) {
        setError(err.message || t("error"));
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [dishId, i18n.language, t]);

  const handleToggleFavorite = async () => {
    if (!dish || favoriteLoading) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        // Remove from favorites
        const res = await fetch(`${API_BASE}/favorites`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ dish_id: dishId })
        });

        if (res.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const res = await fetch(`${API_BASE}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ dish_id: dishId })
        });

        if (res.ok) {
          setIsFavorite(true);
        } else {
          const data = await res.json();
          throw new Error(data.message || t("error"));
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error(err.message || t("error"));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const getSpicinessLabel = (level) => {
    return t(`spiciness_levels.${level}`, { defaultValue: `${level}/5` });
  };

  const getOptionLabel = (option) => {
    if (i18n.language === "jp") {
      return option.name_japanese || option.name_vietnamese || "";
    }
    return option.name_vietnamese || option.name_japanese || "";
  };

  if (loading) {
    return (
      <div className="dish-detail-loading">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="dish-detail-error">
        <p>{error || t("not_found")}</p>
        {onBack && (
          <button onClick={onBack} className="back-button">
            {t("back_to_search")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="dish-detail-page">
      {onBack && (
        <button onClick={onBack} className="back-link">
          {t("back_to_search")}
        </button>
      )}

      <div className="dish-detail-layout">
        {/* Left Column - Dish Information */}
        <div className="dish-info-column">
          <div className="dish-image-container">
            {dish.image_url ? (
              <img
                src={dish.image_url}
                alt={t("dish_image_alt")}
                className="dish-image"
              />
            ) : (
              <div className="dish-image-placeholder">
                <span>🍽️</span>
              </div>
            )}
          </div>

          <div className="dish-header">
            <h1 className="dish-name-jp">{dish.name_japanese}</h1>
            {dish.name_vietnamese && (
              <h2 className="dish-name-vi">{dish.name_vietnamese}</h2>
            )}
            {dish.name_romaji && (
              <p className="dish-name-romaji">{dish.name_romaji}</p>
            )}
          </div>

          <div className="dish-tags">
            {dish.region && (
              <span className="tag tag-region">
                {t("region_label")}: {getOptionLabel(dish.region)}
              </span>
            )}
            {dish.spiciness_level !== undefined && dish.spiciness_level !== null && (
              <span className="tag tag-spiciness">
                {t("spiciness_label")}: {getSpicinessLabel(dish.spiciness_level)}
                <span className="spice-icons">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`spice-icon ${level <= dish.spiciness_level ? "filled" : ""}`}
                    >
                      🌶️
                    </span>
                  ))}
                </span>
              </span>
            )}
          </div>

          {dish.description_vietnamese || dish.description_japanese || dish.description_romaji ? (
            <div className="dish-section">
              <h3>{t("description_label")}</h3>
              <div className="description-content">
                {i18n.language === "jp" && dish.description_japanese && (
                  <p>{dish.description_japanese}</p>
                )}
                {i18n.language === "vi" && dish.description_vietnamese && (
                  <p>{dish.description_vietnamese}</p>
                )}
                {dish.description_romaji && (
                  <p className="romaji-text">{dish.description_romaji}</p>
                )}
              </div>
            </div>
          ) : null}

          {dish.ingredients && (
            <div className="dish-section">
              <h3>{t("ingredients_label")}</h3>
              <div className="ingredients-list">
                {dish.ingredients.split("\n").filter(ing => ing.trim()).map((ingredient, idx) => (
                  <span key={idx} className="ingredient-tag">
                    {ingredient.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dish.how_to_eat && (
            <div className="dish-section">
              <h3>{t("how_to_eat_label")}</h3>
              <p className="how-to-eat-text">{dish.how_to_eat}</p>
            </div>
          )}

          <button
            className={`favorite-button ${isFavorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            <span className="heart-icon">{isFavorite ? "❤️" : "🤍"}</span>
            {isFavorite ? t("remove_from_favorites") : t("add_to_favorites")}
          </button>
        </div>

        {/* Right Column - AI Generator */}
        <div className="ai-column">
          <AIGenerator dishId={dishId} dishName={dish.name_japanese} />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

