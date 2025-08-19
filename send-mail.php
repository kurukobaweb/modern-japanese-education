<?php
// CORS対応（必要に応じて）
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POSTリクエストのみ受け付け
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'メソッドが許可されていません']);
    exit;
}

// 入力データの取得と検証
$companyName = trim($_POST['companyName'] ?? '');
$companyEmail = trim($_POST['companyEmail'] ?? '');
$phoneNumber = trim($_POST['phoneNumber'] ?? '');
$lastName = trim($_POST['lastName'] ?? '');
$firstName = trim($_POST['firstName'] ?? '');
$inquiryContent = trim($_POST['inquiryContent'] ?? '');

// 必須項目チェック
$errors = [];
if (empty($companyName)) $errors[] = '会社名は必須です';
if (empty($companyEmail)) $errors[] = '会社のメールアドレスは必須です';
if (empty($phoneNumber)) $errors[] = '電話番号は必須です';
if (empty($lastName)) $errors[] = 'お名前（姓）は必須です';
if (empty($firstName)) $errors[] = 'お名前（名）は必須です';
if (empty($inquiryContent)) $errors[] = 'お問い合わせ内容は必須です';

// メールアドレス形式チェック
if (!empty($companyEmail) && !filter_var($companyEmail, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません';
}

// エラーがある場合は終了
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// 入力値のサニタイズ
$companyName = htmlspecialchars($companyName, ENT_QUOTES, 'UTF-8');
$companyEmail = htmlspecialchars($companyEmail, ENT_QUOTES, 'UTF-8');
$phoneNumber = htmlspecialchars($phoneNumber, ENT_QUOTES, 'UTF-8');
$lastName = htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8');
$firstName = htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8');
$inquiryContent = htmlspecialchars($inquiryContent, ENT_QUOTES, 'UTF-8');

// メール設定
$to = 'm-saito@modern.co.jp';
$subject = '日本語学習ページからのお問い合わせ';

// メール本文の作成
$message = "
お問い合わせ内容

会社名: {$companyName}
会社のメールアドレス: {$companyEmail}
電話番号: {$phoneNumber}
お名前: {$lastName} {$firstName}

お問い合わせ内容:
{$inquiryContent}

---
この問い合わせは、Webサイトのお問い合わせフォームから送信されました。
送信日時: " . date('Y-m-d H:i:s') . "
";

// メールヘッダー
$headers = [];
$headers[] = 'From: ' . $companyEmail;
$headers[] = 'Reply-To: ' . $companyEmail;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// メール送信
if (mail($to, $subject, $message, implode("\r\n", $headers))) {
    // 送信成功
    echo json_encode([
        'success' => true, 
        'message' => 'お問い合わせありがとうございます。通常1営業日以内にご返信いたします。'
    ]);
} else {
    // 送信失敗
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。'
    ]);
}

?>
