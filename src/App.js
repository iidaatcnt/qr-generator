// 統合された文字入力システム

const UNIFIED_TABS = [
  { id: 'text', label: '文字', icon: 'Type' },        // ★ 統合タブ
  { id: 'batch', label: '一括', icon: 'Grid' },      // 一括生成
  { id: 'decode', label: '解読', icon: 'Search' }    // 解読機能
];

// 自動判定・処理システム
const processUnifiedText = (input) => {
  const text = input.trim();
  
  // 1. 連絡先情報の自動検出
  if (isContactInfo(text)) {
    return processContactInfo(text);
  }
  
  // 2. URLの自動検出・補完
  if (isURL(text)) {
    return processURL(text);
  }
  
  // 3. その他はそのままテキストとして処理
  return text;
};

// 連絡先情報の検出
const isContactInfo = (text) => {
  const contactKeywords = [
    '名前', '電話', 'メール', '会社', '組織',
    'name', 'phone', 'email', 'company', 'tel'
  ];
  
  const lines = text.toLowerCase().split('\n');
  return lines.some(line => 
    contactKeywords.some(keyword => line.includes(keyword))
  );
};

// 連絡先情報の処理（簡易パース）
const processContactInfo = (text) => {
  const lines = text.split('\n');
  const contact = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  };
  
  lines.forEach(line => {
    const lower = line.toLowerCase();
    
    // 名前の抽出
    if (lower.includes('名前') || lower.includes('name')) {
      const name = line.split(/[:：]/)[1]?.trim();
      if (name) {
        const parts = name.split(/[\s　]+/);
        contact.firstName = parts[0] || '';
        contact.lastName = parts[1] || '';
      }
    }
    
    // 電話番号の抽出
    if (lower.includes('電話') || lower.includes('phone') || lower.includes('tel')) {
      contact.phone = line.split(/[:：]/)[1]?.trim() || '';
    }
    
    // メールの抽出
    if (lower.includes('メール') || lower.includes('email') || lower.includes('mail')) {
      contact.email = line.split(/[:：]/)[1]?.trim() || '';
    }
    
    // 会社・組織の抽出
    if (lower.includes('会社') || lower.includes('組織') || lower.includes('company')) {
      contact.organization = line.split(/[:：]/)[1]?.trim() || '';
    }
    
    // URLの抽出
    if (lower.includes('http') || lower.includes('www.')) {
      contact.url = line.trim();
    }
  });
  
  // vCard形式に変換
  return generateVCard(contact);
};

// URL検出
const isURL = (text) => {
  // URLパターンの検出
  const urlPatterns = [
    /^https?:\/\//i,           // http://, https://
    /^www\./i,                 // www.
    /\.[a-z]{2,}$/i,          // .com, .jp など
    /\.[a-z]{2,}\/[^\s]*$/i   // .com/path など
  ];
  
  return urlPatterns.some(pattern => pattern.test(text.trim()));
};

// URL処理
const processURL = (text) => {
  let url = text.trim();
  
  // プロトコルの自動追加
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
};

// 統合UI表示例
const UnifiedTextInput = () => {
  const [textInput, setTextInput] = useState('');
  const [detectedType, setDetectedType] = useState('');
  
  const handleInputChange = (value) => {
    setTextInput(value);
    
    // リアルタイム検出
    if (isContactInfo(value)) {
      setDetectedType('👤 連絡先情報として認識');
    } else if (isURL(value)) {
      setDetectedType('🔗 URLとして認識');
    } else if (value.trim()) {
      setDetectedType('📝 テキストとして認識');
    } else {
      setDetectedType('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          文字・URL・連絡先情報
        </label>
        
        <textarea
          value={textInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={`以下のいずれかを入力してください：

• URL: https://example.com
• テキスト: 自由なメッセージ
• 連絡先情報:
  名前: 山田太郎
  電話: 090-1234-5678
  メール: yamada@example.com
  会社: 株式会社サンプル`}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
        />
        
        {detectedType && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              {detectedType}
            </span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          💡 入力内容を自動判定してQRコードを生成します
        </p>
      </div>
    </div>
  );
};

// 使用例のテキスト例
const EXAMPLE_INPUTS = {
  url: "https://example.com",
  
  text: "今日は良い天気ですね！\nQRコードでメッセージを共有できます。",
  
  contact: `名前: 山田太郎
電話: 090-1234-5678
メール: yamada@example.com
会社: 株式会社サンプル
ウェブサイト: https://example.com`,
  
  mixed: `こんにちは！
私の連絡先です：

名前: 田中花子
電話: 080-9876-5432
メール: tanaka@sample.co.jp

よろしくお願いします。`
};
