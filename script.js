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

    // ローディング状態を管理する関数
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

    // フォームデータを作成する関数
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

    // フォームを送信する関数（新しい実装）
    async function submitForm() {
        // バリデーションチェック
        if (!validateForm()) {
            return;
        }

        // ローディング状態にセット
        setLoadingState(true);

        try {
            // フォームデータを作成
            const formData = createFormData();

            // サーバーにPOSTリクエストを送信
            const response = await fetch('./send-mail.php', {
                method: 'POST',
                body: formData
            });

            // レスポンスをJSONで解析
            const result = await response.json();

            if (result.success) {
                // 送信成功
                alert(result.message);
                clearForm();
            } else {
                // 送信失敗
                alert('エラー: ' + result.message);
            }

        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信中にエラーが発生しました。ネットワーク接続を確認してもう一度お試しください。');
        } finally {
            // ローディング状態を解除
            setLoadingState(false);
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
                color: #121111;
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


// ...既存のスクリプトはそのまま...

// ▼▼▼ 以下をファイルの末尾に追加 ▼▼▼

// スピーチアプリ説明文の「続きを読む」機能
document.addEventListener('DOMContentLoaded', function() {
    const descriptionContainer = document.getElementById('speechAppDescription');
    if (!descriptionContainer) return;

    const originalText = descriptionContainer.textContent.trim();
    let isExpanded = false;

    function setupReadMore() {
        const isMobile = window.innerWidth <= 750;
        const limit = isMobile ? 100 : 150;

        // 全文表示状態であれば何もしない
        if (isExpanded) {
            descriptionContainer.innerHTML = originalText.replace(/\n/g, '<br>');
            return;
        }

        if (originalText.length > limit) {
            const shortText = originalText.substring(0, limit);
            const remainingText = originalText.substring(limit);

            descriptionContainer.innerHTML = `
                <span class="short-text">${shortText.replace(/\n/g, '<br>')}</span><span class="dots">...</span><span class="remaining-text hidden">${remainingText.replace(/\n/g, '<br>')}</span>
                <button class="read-more-btn">続きを読む</button>
            `;

            const readMoreBtn = descriptionContainer.querySelector('.read-more-btn');
            readMoreBtn.addEventListener('click', function() {
                const dots = descriptionContainer.querySelector('.dots');
                const remaining = descriptionContainer.querySelector('.remaining-text');
                
                isExpanded = !isExpanded; // 状態を切り替え

                if (isExpanded) {
                    dots.style.display = 'none';
                    remaining.classList.remove('hidden');
                    this.textContent = '閉じる';
                } else {
                    dots.style.display = 'inline';
                    remaining.classList.add('hidden');
                    this.textContent = '続きを読む';
                }
            });
        } else {
            // 文字数が制限に満たない場合は全文表示
            descriptionContainer.innerHTML = originalText.replace(/\n/g, '<br>');
        }
    }

    // 初期表示
    setupReadMore();

    // ウィンドウリサイズ時に再設定
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setupReadMore, 250);
    });
});

// 汎用スタイルとして reset.css に `hidden` クラスがあるのでそれを利用
// もしなければ、以下のCSSをどこかに追加してください。
/*
.hidden {
    display: none;
}
*/
