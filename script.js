// お問い合わせフォームの機能実装
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const companyName = document.getElementById('companyName');
    const companyEmail = document.getElementById('companyEmail');
    const phoneNumber = document.getElementById('phoneNumber');
    const lastName = document.getElementById('lastName');
    const firstName = document.getElementById('firstName');
    const inquiryContent = document.getElementById('inquiryContent');
    
    // 正しいセレクターに修正
    const submitButton = document.querySelector('.btn-submit');

    // 要素の存在確認
    if (!form || !submitButton) {
        console.error('フォーム要素が見つかりません');
        return;
    }

    // プレースホルダーの初期値を保存
    const placeholders = {
        companyName: companyName.placeholder,
        companyEmail: companyEmail.placeholder,
        phoneNumber: phoneNumber.placeholder,
        lastName: lastName.placeholder,
        firstName: firstName.placeholder,
        inquiryContent: inquiryContent.placeholder
    };

    // プレースホルダー管理関数
    function managePlaceholder(field, originalPlaceholder) {
        field.addEventListener('focus', function() {
            if (this.placeholder === originalPlaceholder) {
                this.placeholder = '';
            }
        });

        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.placeholder = originalPlaceholder;
            }
        });

        field.addEventListener('input', function() {
            if (this.value.trim() !== '' && this.placeholder === originalPlaceholder) {
                this.placeholder = '';
            }
        });
    }

    // 各フィールドにプレースホルダー管理を適用
    managePlaceholder(companyName, placeholders.companyName);
    managePlaceholder(companyEmail, placeholders.companyEmail);
    managePlaceholder(phoneNumber, placeholders.phoneNumber);
    managePlaceholder(lastName, placeholders.lastName);
    managePlaceholder(firstName, placeholders.firstName);
    managePlaceholder(inquiryContent, placeholders.inquiryContent);

    // メールアドレスの形式をチェックする関数
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 入力フィールドのエラー状態をクリアする関数
    function clearFieldError(field) {
        field.classList.remove('error');
        // 親要素のエラースタイルもクリア
        field.parentElement.classList.remove('error');
    }

    // 入力フィールドにエラー状態を設定する関数
    function setFieldError(field) {
        field.classList.add('error');
        // 親要素にもエラースタイルを適用
        field.parentElement.classList.add('error');
    }

    // 全フィールドのバリデーションを行う関数
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

        // 全フィールドのエラー状態をクリア
        fields.forEach(field => clearFieldError(field.element));

        // 必須項目のチェック
        fields.forEach(field => {
            if (!field.value) {
                setFieldError(field.element);
                isValid = false;
            }
        });

        // メールアドレスの形式チェック
        if (companyEmail.value.trim() && !validateEmail(companyEmail.value.trim())) {
            setFieldError(companyEmail);
            isValid = false;
        }

        return isValid;
    }

    // フォームをクリアする関数
    function clearForm() {
        form.reset();
        // エラー状態もクリア
        const allFields = [companyName, companyEmail, phoneNumber, lastName, firstName, inquiryContent];
        allFields.forEach(field => {
            clearFieldError(field);
            // プレースホルダーを元に戻す
            const fieldName = field.id;
            if (placeholders[fieldName]) {
                field.placeholder = placeholders[fieldName];
            }
        });
    }

    // mailto用のメール本文を作成する関数
    function createEmailBody() {
        const body = `
お問い合わせ内容

会社名: ${companyName.value.trim()}
会社のメールアドレス: ${companyEmail.value.trim()}
電話番号: ${phoneNumber.value.trim()}
お名前: ${lastName.value.trim()} ${firstName.value.trim()}

お問い合わせ内容:
${inquiryContent.value.trim()}

---
この問い合わせは、Webサイトのお問い合わせフォームから送信されました。
        `.trim();
        
        return encodeURIComponent(body);
    }

    // フォームを送信する関数
    function submitForm() {
        // バリデーションチェック
        if (!validateForm()) {
            // エラーがある場合は処理を中断
            return;
        }

        try {
            // mailto URLを作成
            const subject = encodeURIComponent('Webサイトからのお問い合わせ');
            const body = createEmailBody();
            const mailtoUrl = `mailto:m-ogawa@modern.co.jp?subject=${subject}&body=${body}`;

            // メールソフトを起動
            window.location.href = mailtoUrl;

            // 成功メッセージを表示
            setTimeout(() => {
                alert('お問い合わせありがとうございます。');
                // フォームをクリア
                clearForm();
            }, 500); // メールソフト起動後に少し遅延してメッセージ表示

        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信中にエラーが発生しました。もう一度お試しください。');
        }
    }

    // 各入力フィールドにフォーカス時のイベントリスナーを追加
    [companyName, companyEmail, phoneNumber, lastName, firstName, inquiryContent].forEach(field => {
        field.addEventListener('focus', function() {
            clearFieldError(this);
        });

        field.addEventListener('input', function() {
            if (this.classList.contains('error') && this.value.trim()) {
                clearFieldError(this);
            }
        });
    });

    // メールアドレスフィールドにリアルタイムバリデーションを追加
    companyEmail.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            setFieldError(this);
        }
    });

    // 送信ボタンのイベントリスナー
    submitButton.addEventListener('click', function(e) {
        e.preventDefault(); // デフォルトの送信動作を防ぐ
        submitForm();
    });

    // フォーム送信イベントのリスナー（Enterキー対応）
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // デフォルトの送信動作を防ぐ
        submitForm();
    });

    // Enterキーでのフォーム送信制御（textareaは除く）
    form.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            // 送信ボタンの場合は送信実行
            if (e.target.classList.contains('btn-submit')) {
                submitForm();
            }
        }
    });

    console.log('お問い合わせフォームが初期化されました。');
});

// モバイル時のテキスト折りたたみ機能
document.addEventListener('DOMContentLoaded', function() {
    const description = document.querySelector('.example-section__description');
    
    if (description && window.innerWidth <= 750) {
        const fullText = description.textContent;
        const shortText = fullText.substring(0, 60) + '...';
        
        // 短縮テキストと「続きを読む」ボタンを作成
        description.innerHTML = `
            <span class="short-text">${shortText}</span>
            <span class="full-text hidden">${fullText}</span>
            <button class="read-more-btn" style="
                background: none;
                border: none;
                color: #dc143c;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                margin-left: 5px;
                text-decoration: underline;
            ">続きを読む</button>
        `;
        
        // 「続きを読む」ボタンのイベントリスナー
        const readMoreBtn = description.querySelector('.read-more-btn');
        const shortTextSpan = description.querySelector('.short-text');
        const fullTextSpan = description.querySelector('.full-text');
        
        if (readMoreBtn && shortTextSpan && fullTextSpan) {
            readMoreBtn.addEventListener('click', function() {
                if (fullTextSpan.classList.contains('hidden')) {
                    // 全文表示
                    shortTextSpan.style.display = 'none';
                    fullTextSpan.classList.remove('hidden');
                    readMoreBtn.textContent = '閉じる';
                } else {
                    // 短縮表示
                    shortTextSpan.style.display = 'inline';
                    fullTextSpan.classList.add('hidden');
                    readMoreBtn.textContent = '続きを読む';
                }
            });
        }
    }
    
    // ウィンドウリサイズ時の再初期化
    window.addEventListener('resize', function() {
        if (window.innerWidth > 750) {
            // PC表示時は全文表示に戻す
            if (description) {
                const fullTextElement = description.querySelector('.full-text');
                if (fullTextElement) {
                    description.innerHTML = fullTextElement.textContent;
                }
            }
        }
    });
});
