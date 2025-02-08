document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartItemsElement = document.getElementById("cart-items");
    const cartHeader = document.getElementById("cart-header");
    const submitBtn = document.getElementById("submit-btn");
    const consentCheckbox = document.getElementById("consent-checkbox");
    const telegramInput = document.getElementById("telegram");

    const updateCart = () => {
        cartItemsElement.innerHTML = cart.length === 0
            ? "<p>Ваш кошик порожній.</p>"
            : cart.map((item, index) => `
                <li class="cart-item">
                    <img src="${item.jpg}" alt="${item.name}" class="cart-img">
                    <div class="cart-info">
                        <span class="cart-name">${item.name}</span>
                        <span class="cart-price">${item.price}</span>
                        <label>Кількість:</label>
                        <input type="number" class="quantity" data-index="${index}" value="1" min="1">
                        <label>Фото:</label>
                        <input type="file" class="photo" data-index="${index}" accept="image/*">
                    </div>
                    <div class="remove-item" data-index="${index}">×</div>
                </li>
            `).join("");
    };

    updateCart();

    cartHeader.addEventListener("click", () => {
        const arrow = cartHeader.querySelector(".arrow");
        if (cartItemsElement.style.display === "none" || cartItemsElement.style.display === "") {
            cartItemsElement.style.display = "block";
            arrow.textContent = "❌";
        } else {
            cartItemsElement.style.display = "none";
            arrow.textContent = "⬇️";
        }
    });

    telegramInput.addEventListener("input", () => {
        if (!telegramInput.value.startsWith("@")) {
            telegramInput.value = "@" + telegramInput.value.replace(/^@+/, "");
        }
    });

    const updateButtonState = () => {
        submitBtn.disabled = !consentCheckbox.checked;
        submitBtn.style.backgroundColor = consentCheckbox.checked ? "#007bff" : "gray";
        submitBtn.style.cursor = consentCheckbox.checked ? "pointer" : "not-allowed";
    };
    consentCheckbox.addEventListener("change", updateButtonState);
    updateButtonState();

    cartItemsElement.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-item")) {
            const index = event.target.dataset.index;
            cart.splice(index, 1);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            updateCart();
        }
    });

    submitBtn.addEventListener("click", async () => {
        const visibleFields = document.querySelectorAll("#courier-fields:not(.hidden) input, #branch-fields:not(.hidden) input, #branch-fields:not(.hidden) select, #locker-fields:not(.hidden) input, #locker-fields:not(.hidden) select, #receiver-info:not(.hidden) input");

        let isValid = true;
        visibleFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add("error");
            } else {
                field.classList.remove("error");
            }
        });

        if (!isValid) {
            alert('Заповніть всі обов’язкові поля!');
            return;
        }

        const botToken = '7609021461:AAGc8uPCQMjSleXxVopUCNfqPLmF5OSt2ds';
        const chatId = '-1002479073400';
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const telegram = telegramInput.value.trim();
        const paymentMethod = document.getElementById('payment-method').value;
        const deliveryType = document.getElementById('delivery-type').value;
        const receiverName = document.getElementById("receiver-name").value.trim();
        const receiverPhone = document.getElementById("receiver-phone").value.trim();

        let deliveryAddress = "";
        if (deliveryType === "courier") {
            const city = document.getElementById("courier-city").value.trim();
            const street = document.getElementById("courier-street").value.trim();
            const apartment = document.getElementById("courier-apartment").value.trim();
            deliveryAddress = `Кур'єрська доставка: ${city}, ${street}${apartment ? `, кв. ${apartment}` : ""}`;
        } else if (deliveryType === "branch") {
            const city = document.getElementById("branch-city").value.trim();
            const branchSelect = document.getElementById("branch-select");
            const branchDescription = branchSelect.options[branchSelect.selectedIndex]?.textContent || "Невідоме відділення";
            deliveryAddress = `Відділення: ${city}, ${branchDescription}`;
        } else if (deliveryType === "locker") {
            const city = document.getElementById("locker-city").value.trim();
            const lockerSelect = document.getElementById("locker-select");
            const lockerDescription = lockerSelect.options[lockerSelect.selectedIndex]?.textContent || "Невідомий поштомат";
            deliveryAddress = `Поштомат: ${city}, ${lockerDescription}`;
        }

        const orderDetails = Array.from(document.querySelectorAll("#cart-items .cart-item")).map((item, index) => ({
            name: cart[index].name,
            quantity: item.querySelector(".quantity").value,
            size: item.querySelector(".size")?.value || "Не вказано",
            photo: item.querySelector(".photo").files[0]
        }));

        const messageText = `
        🛒 *Нове замовлення:*
        - Ім'я: ${name}
        - Email: ${email}
        - Telegram: ${telegram}
        - Доставка: ${deliveryType}
        - Адреса: ${deliveryAddress}
        - Одержувач: ${receiverName}, ${receiverPhone}
        - Оплата: ${paymentMethod}
        - Товари:
        ${orderDetails.map(item => `${item.name} (кількість: ${item.quantity}, розмір: ${item.size})`).join("\n")}
        `;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: messageText, parse_mode: 'Markdown' })
            });

            if (response.ok) {
                alert('Замовлення успішно надіслано!');
            } else {
                alert('Помилка при надсиланні замовлення.');
            }
        } catch (error) {
            console.error('Помилка:', error);
        }
    });
});