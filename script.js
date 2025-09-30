// お問い合わせフォームの機能実装
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        const companyName = document.getElementById('companyName');
        const companyEmail = document.getElementById('companyEmail');
        const phoneNumber = document.getElementById('phoneNumber');
        const lastName = document.getElementById('lastName');
        const firstName = document.getElementById('firstName');
        const inquiryContent = document.getElementById('inquiryContent');
        const submitButton = document.querySelector('.btn-submit');

        if (!submitButton) {
            console.error('フォーム要素が見つかりません');
            return;
        }

        const placeholders = {
            companyName: companyName.placeholder,
            companyEmail: companyEmail.placeholder,
            phoneNumber: phoneNumber.placeholder,
            lastName: lastName.placeholder,
            firstName: firstName.placeholder,
            inquiryContent: inquiryContent.placeholder
        };

        function managePlaceholder(field, originalPlaceholder) {
            field.addEventListener('focus', function() {
                if (this.placeholder === originalPlaceholder) this.placeholder = '';
            });
            field.addEventListener('blur', function() {
                if (this.value.trim() === '') this.placeholder = originalPlaceholder;
            });
            field.addEventListener('input', function() {
                if (this.value.trim() !== '' && this.placeholder === originalPlaceholder) {
                    this.placeholder = '';
                }
            });
        }

        managePlaceholder(companyName, placeholders.companyName);
        managePlaceholder(companyEmail, placeholders.companyEmail);
        managePlaceholder(phoneNumber, placeholders.phoneNumber);
        managePlaceholder(lastName, placeholders.lastName);
        managePlaceholder(firstName, placeholders.firstName);
        managePlaceholder(inquiryContent, placeholders.inquiryContent);

        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function clearFieldError(field) {
            field.classList.remove('error');
            field.parentElement.classList.remove('error');
        }

        function setFieldError(field) {
            field.classList.add('error');
            field.parentElement.classList.add('error');
        }

        function validateForm() {
            let isValid = true;
            const fields = [
                { element: companyName, value: companyName.value.trim() },
                { element: companyEmail, value: companyEmail.value.trim() },
                { element: phoneNumber, value: phoneNumber.value.trim() },
                { element: lastName, value: lastName.value.trim() },
                { element: firstName, value: firstName.value.trim() },
                { element: inquiryContent, value: inquiryContent.value.trim() }
            ];

            fields.forEach(field => clearFieldError(field.element));

            fields.forEach(field => {
                if (!field.value) {
                    setFieldError(field.element);
                    isValid = false;
                }
            });

            if (companyEmail.value.trim() && !validateEmail(companyEmail.value.trim())) {
                setFieldError(companyEmail);
                isValid = false;
            }

            return isValid;
        }

        function clearForm() {
            form.reset();
            const allFields = [companyName, companyEmail, phoneNumber, lastName, firstName, inquiryContent];
            allFields.forEach(field => {
                clearFieldError(field);
                const fieldName = field.id;
                if (placeholders[fieldName]) {
                    field.placeholder = placeholders[fieldName];
                }
            });
        }

        function setLoadingState(isLoading) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.querySelector('.btn-submit__text').textContent = '送信中...';
                submitButton.style.opacity = '0.6';
            } else {
                submitButton.disabled = false;
                submitButton.querySelector('.btn-submit__text').textContent = '送信する';
                submitButton.style.opacity = '1';
            }
        }

        function createFormData() {
            const formData = new FormData();
            formData.append('companyName', companyName.value.trim());
            formData.append('companyEmail', companyEmail.value.trim());
            formData.append('phoneNumber', phoneNumber.value.trim());
            formData.append('lastName', lastName.value.trim());
            formData.append('firstName', firstName.value.trim());
            formData.append('inquiryContent', inquiryContent.value.trim());
            return formData;
        }

        async function submitForm() {
            if (!validateForm()) return;
            setLoadingState(true);

            try {
                const formData = createFormData();
                const response = await fetch('./send-mail.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    clearForm();
                } else {
                    alert('エラー: ' + result.message);
                }

            } catch (error) {
                console.error('送信エラー:', error);
                alert('送信中にエラーが発生しました。ネットワーク接続を確認してもう一度お試しください。');
            } finally {
                setLoadingState(false);
            }
        }

        [companyName, companyEmail, phoneNumber, lastName, firstName, inquiryContent].forEach(field => {
            field.addEventListener('focus', function() { clearFieldError(this); });
            field.addEventListener('input', function() {
                if (this.classList.contains('error') && this.value.trim()) {
                    clearFieldError(this);
                }
            });
        });

        companyEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) setFieldError(this);
        });

        submitButton.addEventListener('click', e => {
            e.preventDefault();
            submitForm();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            submitForm();
        });

        form.addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (e.target.classList.contains('btn-submit')) submitForm();
            }
        });

        console.log('お問い合わせフォームが初期化されました。');
    }
});

// スピーチアプリ説明文の「続きを読む」機能
document.addEventListener('DOMContentLoaded', function() {
    const descriptionContainer = document.getElementById('speechAppDescription');
    if (!descriptionContainer) return;

    const originalText = descriptionContainer.innerHTML.trim();
    let isExpanded = false;

    function setupReadMore() {
        const isMobile = window.innerWidth <= 750;
        const limit = isMobile ? 100 : 150;
        const textContent = descriptionContainer.textContent.trim();
        
        if (isExpanded || textContent.length <= limit) {
            descriptionContainer.innerHTML = originalText.replace(/\n\s*\n/g, '<br><br>').replace(/\n/g, '<br>');
            return;
        }
        
        const shortText = textContent.substring(0, limit);
        
        descriptionContainer.innerHTML = `
            <span class="short-text">${shortText.replace(/\n/g, '<br>')}</span><span class="dots">...</span>
            <button class="read-more-btn">続きを読む</button>
        `;

        const readMoreBtn = descriptionContainer.querySelector('.read-more-btn');
        readMoreBtn.addEventListener('click', function() {
            isExpanded = true;
            descriptionContainer.innerHTML = originalText.replace(/\n\s*\n/g, '<br><br>').replace(/\n/g, '<br>');
        });
    }

    setupReadMore();

    // ▼▼▼ ここから修正 ▼▼▼
    let lastWindowWidth = window.innerWidth;
    let resizeTimer;

    window.addEventListener('resize', function() {
        // 現在のウィンドウ幅が前回の幅と異なる場合のみ再設定を実行
        // (スマホのスクロールによるリサイズイベントを無視するため)
        if (window.innerWidth !== lastWindowWidth) {
            clearTimeout(resizeTimer);
            
            resizeTimer = setTimeout(() => {
                isExpanded = false; // 状態をリセット
                setupReadMore();
                lastWindowWidth = window.innerWidth; // 新しい画面幅を保存
            }, 250);
        }
    });
    // ▲▲▲ ここまで修正 ▲▲▲
});
