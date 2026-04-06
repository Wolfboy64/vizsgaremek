import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Products.css";

const SORT_OPTIONS = {
  idAsc: "idAsc",
  idDesc: "idDesc",
  ramAsc: "ramAsc",
  ramDesc: "ramDesc",
};

const RAM_PATTERN = /(\d+(?:[.,]\d+)?)\s*GB/i;

const parseRamValue = (ramText) => {
  if (!ramText) return -1;
  const match = String(ramText).match(RAM_PATTERN);
  if (!match) return -1;

  const numeric = Number(match[1].replace(",", "."));
  return Number.isFinite(numeric) ? numeric : -1;
};

const Products = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.idAsc);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/eszkoz");
      const receivedProducts = Array.isArray(response.data) ? response.data : [];
      setProducts(receivedProducts);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Nem sikerült betölteni a termékeket az adatbázisból.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const operatorOptions = useMemo(() => {
    const operators = products
      .map((item) => item.uzemelteto_nev)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "hu"));

    return [...new Set(operators)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const byOperator =
        selectedOperator === "all" || product.uzemelteto_nev === selectedOperator;

      const searchableText = [
        product.id,
        product.leiras,
        product.cpu,
        product.ram,
        product.hdd,
        product.uzemelteto_nev,
        product.uzemelteto_leiras,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const bySearch =
        normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

      return byOperator && bySearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.idDesc:
          return b.id - a.id;
        case SORT_OPTIONS.ramAsc:
          return parseRamValue(a.ram) - parseRamValue(b.ram);
        case SORT_OPTIONS.ramDesc:
          return parseRamValue(b.ram) - parseRamValue(a.ram);
        case SORT_OPTIONS.idAsc:
        default:
          return a.id - b.id;
      }
    });

    return sorted;
  }, [products, searchTerm, selectedOperator, sortBy]);

  return (
    <main className={`products-page ${embedded ? "products-page-embedded" : ""}`}>
      <section className="products-hero reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
        <h1>Elérhető szervereink</h1>
        <p>
          Az alábbi lista közvetlenül az adatbázisban tárolt eszközöket jeleníti
          meg.
        </p>
      </section>

      <section className="products-toolbar reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
        <label className="toolbar-field reveal-on-scroll" style={{ "--reveal-delay": "60ms" }}>
          <span>Keresés</span>
          <input
            type="text"
            placeholder="Keresés CPU, RAM, HDD, leírás vagy üzemeltető szerint"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <label className="toolbar-field reveal-on-scroll" style={{ "--reveal-delay": "120ms" }}>
          <span>Üzemeltető</span>
          <select
            value={selectedOperator}
            onChange={(event) => setSelectedOperator(event.target.value)}
          >
            <option value="all">Összes</option>
            {operatorOptions.map((operatorName) => (
              <option key={operatorName} value={operatorName}>
                {operatorName}
              </option>
            ))}
          </select>
        </label>

        <label className="toolbar-field reveal-on-scroll" style={{ "--reveal-delay": "180ms" }}>
          <span>Rendezés</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value={SORT_OPTIONS.idAsc}>ID szerint (növekvő)</option>
            <option value={SORT_OPTIONS.idDesc}>ID szerint (csökkenő)</option>
            <option value={SORT_OPTIONS.ramAsc}>RAM szerint (növekvő)</option>
            <option value={SORT_OPTIONS.ramDesc}>RAM szerint (csökkenő)</option>
          </select>
        </label>
      </section>

      <section className="products-summary reveal-on-scroll" style={{ "--reveal-delay": "180ms" }} aria-live="polite">
        <div className="summary-item reveal-on-scroll" style={{ "--reveal-delay": "80ms" }}>
          <span className="summary-label">Összes termék</span>
          <strong>{products.length}</strong>
        </div>
        <div className="summary-item reveal-on-scroll" style={{ "--reveal-delay": "140ms" }}>
          <span className="summary-label">Találatok</span>
          <strong>{filteredProducts.length}</strong>
        </div>
        <div className="summary-item reveal-on-scroll" style={{ "--reveal-delay": "200ms" }}>
          <span className="summary-label">Üzemeltetők</span>
          <strong>{operatorOptions.length}</strong>
        </div>
      </section>

      {loading && <p className="loading-text reveal-on-scroll is-visible">Termékek betöltése folyamatban...</p>}

      {!loading && error && (
        <div className="products-error reveal-on-scroll is-visible">
          <p className="error-text">{error}</p>
          <button type="button" onClick={fetchProducts} className="retry-button">
            Újrapróbálás
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <p className="no-data reveal-on-scroll is-visible">
          A jelenlegi szűrési feltételek mellett nincs megjeleníthető termék.
        </p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <section className="products-grid">
          {filteredProducts.map((product, index) => (
            <article
              key={product.id}
              className="product-card reveal-on-scroll"
              style={{ "--reveal-delay": `${Math.min(index, 7) * 70}ms` }}
            >
              <header className="product-card-header">
                <span className="product-id">#{product.id}</span>
                <h2>{product.cpu || "Nincs CPU adat"}</h2>
              </header>

              <div className="spec-list">
                <div className="spec-item">
                  <span>RAM</span>
                  <strong>{product.ram || "-"}</strong>
                </div>
                <div className="spec-item">
                  <span>HDD</span>
                  <strong>{product.hdd || "-"}</strong>
                </div>
              </div>

              <p className="product-description">
                {product.leiras || "Ehhez az eszközhöz nincs leírás megadva."}
              </p>

              <footer className="product-footer">
                <span className="operator-name">
                  {product.uzemelteto_nev || "Nincs üzemeltető"}
                </span>
                {product.uzemelteto_leiras && (
                  <p className="operator-description">{product.uzemelteto_leiras}</p>
                )}
                <button
                  type="button"
                  className="select-product-btn"
                  onClick={() => navigate(`/termekek/${product.id}`)}
                >
                  Kiválasztás
                </button>
              </footer>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Products;
