document.addEventListener("DOMContentLoaded", async () => {
    const categorySelect = document.getElementById("category");
    const priceInput = document.getElementById("price");
    const maxPriceSpan = document.getElementById("max-price"); 
    const productsContainer = document.getElementById("products");
    const title = document.getElementById("animated-title"); 
    const navLinks = document.querySelectorAll("nav ul li a"); 
    const searchInput = document.getElementById('search'); 

    try {
        const response = await fetch("/products");
        if (!response.ok) throw new Error("Помилка при завантаженні товарів");
        const products = await response.json();

        const categories = [...new Set(products.map(p => p.category))];

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        const updateMaxPrice = () => {
            const maxPrice = Math.max(...products.map(product => product.price));
            priceInput.max = maxPrice;  
            priceInput.value = maxPrice; 
            maxPriceSpan.textContent = `${maxPrice}₴`; 
        }

        const renderProducts = (filteredProducts) => {
            productsContainer.innerHTML = "";
            filteredProducts.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("card");

                productCard.innerHTML = `
                    <div>
                        <img src="/products/${product.image}" alt="${product.name}">
                        <h4>${product.name}</h4>
                        <p>${product.price}₴</p>
                    </div> 
                    <div>
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <p>${product.price}₴</p>
                        <div class="buttons-container">
                            <button class="button-buy">Buy</button>
                            <button class="button-add-cart">Add to Cart</button>
                        </div>
                    </div>
                `;

                productsContainer.appendChild(productCard);
            });
        }

        const filterProducts = () => {
            const selectedCategory = categorySelect.value;
            const selectedPrice = priceInput.value;
            const searchQuery = searchInput.value.toLowerCase();

            const filteredProducts = products.filter(p => {
                const isCategoryMatch = selectedCategory ? p.category === selectedCategory : true;
                const isPriceMatch = p.price <= selectedPrice;
                const isSearchMatch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
                return isCategoryMatch && isPriceMatch && isSearchMatch;
            });

            renderProducts(filteredProducts);
        }

        updateMaxPrice();
        renderProducts(products);

        categorySelect.addEventListener("change", filterProducts);

        priceInput.addEventListener("input", () => {
            const maxPrice = priceInput.value;
            maxPriceSpan.textContent = `${maxPrice}₴`;
            filterProducts();
        });

        searchInput.addEventListener("input", filterProducts);

        const animateText = (element) => {
            if (!element) return;

            const text = element.textContent;
            element.textContent = ""; 

            let letters = text.split("").map((char) => {
                let span = document.createElement("span");
                span.textContent = char;
                span.classList.add("flicker");
                element.appendChild(span);
                return span;
            });

            let delay = 0;
            let indexes = [...Array(letters.length).keys()].sort(() => Math.random() - 0.5); 

            indexes.forEach((i, idx) => {
                setTimeout(() => {
                    letters[i].classList.remove("flicker");
                }, delay + idx * 150);
            });
        }

        animateText(title);

        navLinks.forEach(link => animateText(link));

    } catch (error) {
        console.error("Помилка:", error);
    }
});
