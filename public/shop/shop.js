document.addEventListener("DOMContentLoaded", async () => {
    const categorySelect = document.getElementById("category");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const minPriceLabel = document.getElementById("min-price-label");
    const maxPriceLabel = document.getElementById("max-price-label");
    const rangePrice = document.getElementById("range-price");
    const productsContainer = document.getElementById("products");
    const title = document.getElementById("animated-title"); 
    const navLinks = document.querySelectorAll("nav ul li a"); 
    const searchInput = document.getElementById('search'); 
    const cartCount = document.getElementById("cart-count");

    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const modalPrice = document.getElementById("modal-price");
    const modalAddCart = document.getElementById("modal-add-cart");
    const closeModal = document.querySelector(".close");

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

        const updatePriceRange = () => {
            const minPrice = Math.min(...products.map(product => product.price));
            const maxPrice = Math.max(...products.map(product => product.price));
            minPriceInput.value = minPrice;
            maxPriceInput.value = maxPrice;
            minPriceInput.min = minPrice;
            maxPriceInput.max = maxPrice;

            // Оновлюємо лейбли
            minPriceLabel.textContent = `${minPrice}₴`;
            maxPriceLabel.textContent = `${maxPrice}₴`;
            
            rangePrice.max = maxPrice;
            rangePrice.value = maxPrice;

            rangePrice.min = minPrice;
        }

        const renderProducts = (filteredProducts) => {
            productsContainer.innerHTML = "";
            if (filteredProducts.length === 0) {
                productsContainer.innerHTML = "<p class='no-products'>Products are not found</p>";
                return;
            }

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
                        <h4>${product.name} (<span class="info-icon" data-id="${product.id}">? </span>)</h4>
                        <p>${product.description}</p>
                        <p>${product.price}₴</p>
                        <div class="buttons-container">
                            <button class="button-buy">Buy</button>
                            <button class="button-add-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                        </div>
                    </div>
                `;

                productsContainer.appendChild(productCard);
            });
            document.querySelectorAll(".button-add-cart").forEach(button => {
                button.addEventListener("click", addToCart);
            });
            document.querySelectorAll(".info-icon").forEach(icon => {
                icon.addEventListener("click", (event) => {
                    event.stopPropagation(); 
                    const productId = event.target.getAttribute("data-id");
                    const product = products.find(p => p.id == productId);
                    if (product) openModal(product);
                });
            });
        }

        const openModal = (product) => {
            modal.style.display = "flex";
            modalImage.src = `/products/${product.image}`;
            modalTitle.textContent = product.name;
            modalDescription.textContent = product.description;
            modalPrice.textContent = product.price;
            modalAddCart.setAttribute("data-id", product.id);
        };

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        window.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        const filterProducts = () => {
            const selectedCategory = categorySelect.value;
            const minPrice = parseInt(minPriceInput.value);
            const maxPrice = parseInt(maxPriceInput.value);
            const searchQuery = searchInput.value.toLowerCase();

            const filteredProducts = products.filter(p => {
                const isCategoryMatch = selectedCategory ? p.category === selectedCategory : true;
                const isPriceMatch = p.price >= minPrice && p.price <= maxPrice;
                const isSearchMatch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
                return isCategoryMatch && isPriceMatch && isSearchMatch;
            });

            renderProducts(filteredProducts);
        }

        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); 
        }

        const addToCart = (event) => {
            const button = event.target;
            const productId = button.getAttribute("data-id");
            const productName = button.getAttribute("data-name");
            const productPrice = button.getAttribute("data-price");

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            const existingProduct = cart.find(item => item.id === productId);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
            }

            localStorage.setItem("cart", JSON.stringify(cart));  // Зберігаємо кошик в localStorage
            updateCartCount();
        }

        updatePriceRange();
        renderProducts(products);
        updateCartCount();

        categorySelect.addEventListener("change", filterProducts);

        minPriceInput.addEventListener("input", () => {
            if (parseInt(minPriceInput.value) > parseInt(maxPriceInput.value)) {
                maxPriceInput.value = minPriceInput.value; 
            }
            minPriceLabel.textContent = `${minPriceInput.value}₴`;
            filterProducts();
        });

        maxPriceInput.addEventListener("input", () => {
            if (parseInt(maxPriceInput.value) < parseInt(minPriceInput.value)) {
                minPriceInput.value = maxPriceInput.value; 
            }
            maxPriceLabel.textContent = `${maxPriceInput.value}₴`;
            filterProducts();
        });

        rangePrice.addEventListener("input", () => {
            maxPriceInput.value = rangePrice.value;
            maxPriceLabel.textContent = `${rangePrice.value}₴`;
            filterProducts();
        });
        

        const cartModal = document.getElementById("cartModal");
        const closeCartModal = document.querySelector(".close-cart");


        document.getElementById("cart-image-button").addEventListener("click", () => {
            cartModal.style.display = "flex"; 
            renderCart(); 
        });


        closeCartModal.addEventListener("click", () => {
            cartModal.style.display = "none"; 
        });


        const renderCart = () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const cartItemsContainer = document.getElementById("cart-items");
            const cartTotal = document.getElementById("cart-total");

            cartItemsContainer.innerHTML = "";  
            let total = 0;

            cart.forEach(item => {
                total += item.price * item.quantity;  
                cartItemsContainer.innerHTML += `<p>${item.name} ${item.price}₴ (${item.quantity}) - ${item.price * item.quantity}₴</p>`;
            });

            cartTotal.textContent = `${total}₴`; 
        };


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
