<?php
// 迷惑メール対策を強化したメール送信処理

// CORS対応
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
$to = 'education_jp@modern.co.jp';
$subject = '【' . $companyName . '】日本語学習サイトからのお問い合わせ';

// メール本文の作成（プレーンテキスト）
$message = "株式会社モダン様

Webサイトのお問い合わせフォームより新しいお問い合わせが届きました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ詳細】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 会社名
{$companyName}

■ 担当者名
{$lastName} {$firstName} 様

■ メールアドレス
{$companyEmail}

■ 電話番号
{$phoneNumber}

■ お問い合わせ内容
{$inquiryContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

送信日時: " . date('Y年m月d日 H:i:s') . "
送信元IP: " . $_SERVER['REMOTE_ADDR'] . "
ユーザーエージェント: " . $_SERVER['HTTP_USER_AGENT'] . "

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは、modern.co.jp のお問い合わせフォームから自動送信されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
";

// 信頼性を高めるメールヘッダー（迷惑メール対策）
$headers = [];

// From ヘッダー（企業ドメインから送信）
$headers[] = 'From: noreply@modern.co.jp';

// Reply-To（お客様に返信する際のアドレス）
$headers[] = 'Reply-To: ' . $companyEmail;

// Return-Path（バウンス処理用）
$headers[] = 'Return-Path: noreply@modern.co.jp';

// Content-Type（文字エンコーディング指定）
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';

// Message-ID（一意性を保つ）
$messageId = '<' . uniqid() . '@modern.co.jp>';
$headers[] = 'Message-ID: ' . $messageId;

// Date ヘッダー
$headers[] = 'Date: ' . date('r');

// X-Mailer（送信プログラムの識別）
$headers[] = 'X-Mailer: Modern Contact Form v1.0';

// X-Priority（通常の優先度）
$headers[] = 'X-Priority: 3 (Normal)';

// 迷惑メール対策のための追加ヘッダー
$headers[] = 'X-Anti-Abuse: This header was added to track abuse';
$headers[] = 'X-Anti-Abuse: Primary Hostname - modern.co.jp';
$headers[] = 'X-Anti-Abuse: Original Domain - modern.co.jp';
$headers[] = 'X-Anti-Abuse: Originator/Caller UID/GID - [' . getmyuid() . '/' . getmygid() . '] / [' . get_current_user() . ']';

// MIME Version
$headers[] = 'MIME-Version: 1.0';

// 管理者向け自動返信も送信（オプション）
$autoReplySubject = 'お問い合わせを受け付けました - 株式会社モダン';
$autoReplyMessage = "{$lastName} {$firstName} 様

この度は、株式会社モダンにお問い合わせいただき、誠にありがとうございます。

以下の内容でお問い合わせを受け付けいたしました。
通常1営業日以内に担当者よりご返信させていただきます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

会社名: {$companyName}
お名前: {$lastName} {$firstName} 様
電話番号: {$phoneNumber}

お問い合わせ内容:
{$inquiryContent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

何かご不明な点がございましたら、下記までお気軽にお問い合わせください。

株式会社モダン
〒113-0034 東京都文京区湯島3丁目12番11号
Email: education_jp@modern.co.jp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
";

// 自動返信用ヘッダー
$autoReplyHeaders = [];
$autoReplyHeaders[] = 'From: 株式会社モダン <noreply@modern.co.jp>';
$autoReplyHeaders[] = 'Reply-To: education_jp@modern.co.jp';
$autoReplyHeaders[] = 'Content-Type: text/plain; charset=UTF-8';
$autoReplyHeaders[] = 'X-Mailer: Modern Contact Form v1.0';

try {
    // メイン送信（管理者宛）
    $mainSent = mail($to, $subject, $message, implode("\r\n", $headers));
    
    // 自動返信（お客様宛）
    $autoReplySent = mail($companyEmail, $autoReplySubject, $autoReplyMessage, implode("\r\n", $autoReplyHeaders));
    
    if ($mainSent) {
        $responseMessage = 'お問い合わせありがとうございます。通常1営業日以内にご返信いたします。';
        
        if ($autoReplySent) {
            $responseMessage .= '確認メールをお送りしましたのでご確認ください。';
        } else {
            $responseMessage .= '確認メールの送信に一部問題が発生しましたが、お問い合わせは正常に受け付けました。';
        }
        
        echo json_encode([
            'success' => true, 
            'message' => $responseMessage
        ]);
    } else {
        // 送信失敗
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'システムエラーが発生しました。管理者にお問い合わせください。'
    ]);
}
?>
