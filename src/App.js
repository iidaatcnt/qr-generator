import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Type, Grid, Search, Download, Copy, Check, Upload } from 'lucide-react';

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [decodedResult, setDecodedResult] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [logoEnabled, setLogoEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [detectedType, setDetectedType] = useState('');
  const [fileName, setFileName] = useState(''); // ファイル名指定用
  const qrContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // 自動判定機能
  const isContactInfo = (text) => {
    const contactKeywords = ['名前', '電話', 'メール', '会社', '組織', 'name', 'phone', 'email', 'company', 'tel'];
    const lines = text.toLowerCase().split('\n');
    return lines.some(line => contactKeywords.some(keyword => line.includes(keyword)));
  };

  const isURL = (text) => {
    const urlPatterns = [/^https?:\/\//i, /^www\./i, /\.[a-z]{2,}$/i, /\.[a-z]{2,}\/[^\s]*$/i];
    return urlPatterns.some(pattern => pattern.test(text.trim()));
  };

  const processContactInfo = (text) => {
    const lines = text.split('\n');
    const contact = { firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' };
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('名前') || lower.includes('name')) {
        const name = line.split(/[:：]/)[1]?.trim();
        if (name) {
          const parts = name.split(/[\s　]+/);
          contact.firstName = parts[0] || '';
          contact.lastName = parts[1] || '';
        }
      }
      if (lower.includes('電話') || lower.includes('phone') || lower.includes('tel')) {
        contact.phone = line.split(/[:：]/)[1]?.trim() || '';
      }
      if (lower.includes('メール') || lower.includes('email') || lower.includes('mail')) {
        contact.email = line.split(/[:：]/)[1]?.trim() || '';
      }
      if (lower.includes('会社') || lower.includes('組織') || lower.includes('company')) {
        contact.organization = line.split(/[:：]/)[1]?.trim() || '';
      }
      if (lower.includes('http') || lower.includes('www.')) {
        contact.url = line.trim();
      }
    });
    
    return 'BEGIN:VCARD\nVERSION:3.0\nFN:' + contact.firstName + ' ' + contact.lastName + '\nN:' + contact.lastName + ';' + contact.firstName + ';;;\nORG:' + contact.organization + '\nTEL:' + contact.phone + '\nEMAIL:' + contact.email + '\nURL:' + contact.url + '\nEND:VCARD';
  };

  const processURL = (text) => {
    let url = text.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  };

  const processUnifiedText = (input) => {
    const text = input.trim();
    if (isContactInfo(text)) {
      return processContactInfo(text);
    }
    if (isURL(text)) {
      return processURL(text);
    }
    return text;
  };

  const handleInputChange = (value) => {
    setTextInput(value);
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

  // QRコード生成
  const createQRCanvas = async (text, size) => {
    if (!size) size = 300;
    
    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const canvas = document.createElement('canvas');
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: size,
        background: 'white',
        foreground: 'black',
        level: logoEnabled ? 'H' : 'M'
      });
      
      if (logoEnabled) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const logoSize = Math.floor(size * 0.10);
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize/2 + 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.font = logoSize.toString() + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText('😊', centerX, centerY);
      }
      
      return canvas;
    } catch (error) {
      console.error('Error creating QR canvas:', error);
      return null;
    }
  };

  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      const canvas = await createQRCanvas(text);
      if (canvas) {
        qrContainerRef.current.innerHTML = '';
        canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
        canvas.style.maxWidth = '300px';
        canvas.style.height = 'auto';
        qrContainerRef.current.appendChild(canvas);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // QRコード解読
  const decodeQRCode = async (imageFile) => {
    setIsDecoding(true);
    setDecodeError('');
    setDecodedResult('');
    
    try {
      if (!window.jsQR) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        const maxSize = 1000;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);
        
        const tryDecode = (imageData) => {
          return window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
        };
        
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = tryDecode(imageData);
        
        if (!code) {
          code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
        }
        
        if (code) {
          setDecodedResult(code.data);
        } else {
          setDecodeError('QRコードが見つかりません。別の画像をお試しください。');
        }
        setIsDecoding(false);
      };
      
      img.onerror = () => {
        setDecodeError('画像の読み込みに失敗しました。');
        setIsDecoding(false);
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
      
    } catch (error) {
      console.error('Error decoding QR code:', error);
      setDecodeError('QRコードの解読中にエラーが発生しました。');
      setIsDecoding(false);
    }
  };

  // ファイル処理
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      decodeQRCode(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      decodeQRCode(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 一括処理
  const generateBatchQRCodes = async () => {
    if (!batchInput.trim()) {
      alert('一括生成するデータを入力してください');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchResults([]);

    try {
      const lines = batchInput.trim().split('\n').filter(line => line.trim());
      const results = [];

      for (const line of lines) {
        const commaIndex = line.indexOf(',');
        if (commaIndex === -1) continue;
        
        const filename = line.substring(0, commaIndex).trim();
        const content = line.substring(commaIndex + 1).trim();
        
        if (filename && content) {
          const canvas = await createQRCanvas(content, 200);
          if (canvas) {
            const dataURL = canvas.toDataURL('image/png');
            results.push({ filename, content, dataURL });
          }
        }
      }

      setBatchResults(results);
    } catch (error) {
      alert('一括生成中にエラーが発生しました');
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const downloadBatchQR = (item) => {
    const link = document.createElement('a');
    link.download = item.filename + '.png';
    link.href = item.dataURL;
    link.click();
  };

  // ファイル名生成・クリーンアップ
  const generateFileName = () => {
    let downloadFileName = fileName.trim();
    
    if (!downloadFileName) {
      // ファイル名が未指定の場合は内容から自動生成
      if (isURL(textInput)) {
        try {
          const url = new URL(processURL(textInput));
          downloadFileName = url.hostname.replace(/^www\./, '') || 'qr-url';
        } catch {
          downloadFileName = 'qr-url';
        }
      } else if (isContactInfo(textInput)) {
        downloadFileName = 'qr-contact';
      } else {
        // テキストの最初の10文字を使用（安全な文字のみ）
        const safeText = textInput.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '').substring(0, 10);
        downloadFileName = safeText || 'qr-text';
      }
    }
    
    // ファイル名を安全な文字のみに制限
    return downloadFileName.replace(/[<>:"/\\|?*]/g, '_');
  };

  const getPreviewFileName = () => {
    const cleanName = generateFileName();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    return cleanName + '_' + timestamp + '.png';
  };

  // ダウンロード・コピー
  const downloadQRCode = () => {
    if (!qrData) return;
    const canvas = qrContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      const finalFileName = getPreviewFileName();
      
      link.download = finalFileName;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const copyDecodedResult = async () => {
    if (decodedResult) {
      try {
        await navigator.clipboard.writeText(decodedResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // エフェクト
  useEffect(() => {
    if (activeTab === 'text') {
      const processedData = processUnifiedText(textInput);
      setQrData(processedData);
      generateQRCode(processedData);
    }
  }, [textInput, logoEnabled, activeTab, fileName]); // fileNameを依存配列に追加

  const tabs = [
    { id: 'text', label: '文字', icon: Type },
    { id: 'batch', label: '一括', icon: Grid },
    { id: 'decode', label: '解読', icon: Search }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            QRコードジェネレーター
          </h1>
          <p className="text-gray-600 text-lg">文字・URL・連絡先を簡単にQRコード化</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={'flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ' + (
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {activeTab === 'text' && (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">文字・URL・連絡先情報</h2>
                    
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ファイル名（任意）
                      </label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="例: my-website、営業資料、連絡先QR"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        🗂️ 拡張子(.png)とタイムスタンプは自動で追加されます
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'batch' && (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">一括QRコード生成</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSV形式でデータを入力: ファイル名,テキスト内容（1行に1つ）
                      </label>
                      <textarea
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        placeholder="qr1,https://example.com
qr2,Hello World
qr3,連絡先情報"
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                      />
                    </div>
                    
                    <button
                      onClick={generateBatchQRCodes}
                      disabled={isGeneratingBatch || !batchInput.trim()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingBatch ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          生成中...
                        </>
                      ) : (
                        <>
                          <Grid className="w-4 h-4" />
                          一括生成
                        </>
                      )}
                    </button>
                    
                    {batchResults.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          生成されたQRコード ({batchResults.length}個)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {batchResults.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                              <div className="mb-3">
                                <img
                                  src={item.dataURL}
                                  alt={'QR Code for ' + item.filename}
                                  className="w-full h-auto rounded-lg shadow-md bg-white mx-auto"
                                  style={{ maxWidth: '150px' }}
                                />
                              </div>
                              <p className="text-sm font-medium text-gray-800 mb-1">{item.filename}</p>
                              <p className="text-xs text-gray-600 mb-3 truncate" title={item.content}>{item.content}</p>
                              <button
                                onClick={() => downloadBatchQR(item)}
                                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                              >
                                <Download className="w-3 h-3" />
                                ダウンロード
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'decode' && (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">QRコード解読</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QRコード画像をアップロード
                      </label>
                      
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors duration-200 cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">QRコード画像をここにドラッグ&ドロップするか、クリックして選択</p>
                        <p className="text-xs text-gray-500">対応形式: PNG, JPG, JPEG, GIF, WebP</p>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {uploadedImage && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{uploadedImage.name}</span>
                            <button
                              onClick={() => setUploadedImage(null)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {isDecoding && (
                        <div className="mt-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <p className="text-sm text-gray-600 mt-2">解読中...</p>
                        </div>
                      )}
                      
                      {decodeError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{decodeError}</p>
                        </div>
                      )}
                      
                      {decodedResult && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">解読結果</h3>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap break-words text-sm text-green-800">{decodedResult}</pre>
                            </div>
                            <button
                              onClick={copyDecodedResult}
                              className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  コピー済み
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  結果をコピー
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {activeTab === 'text' && (
                <div className="flex flex-col items-center space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">生成されたQRコード</h2>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                    <span className="text-sm font-medium text-gray-700">スマイルロゴ:</span>
                    <button
                      onClick={() => setLogoEnabled(!logoEnabled)}
                      className={'flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ' + (
                        logoEnabled
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      )}
                    >
                      {logoEnabled ? '😊 ON' : '⭕ OFF'}
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-sm">
                    {qrData ? (
                      <div className="text-center">
                        <div ref={qrContainerRef} className="flex justify-center">
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                          デバイスでこのQRコードをスキャンしてください
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          文字を入力してQRコードを生成してください
                        </p>
                      </div>
                    )}
                  </div>

                  {qrData && (
                    <>
                      <div className="w-full max-w-sm mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-700 mb-1">📁 ダウンロードファイル名プレビュー:</p>
                          <p className="text-sm font-mono text-blue-800 break-all">
                            {qrData ? getPreviewFileName() : '（QRコード生成後に表示）'}
                          </p>
                          {!fileName.trim() && qrData && (
                            <p className="text-xs text-blue-600 mt-1">
                              💡 ファイル名が未入力のため自動生成されています
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 w-full max-w-sm">
                      <button
                        onClick={downloadQRCode}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        ダウンロード
                      </button>
                      
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            コピー済み
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            データをコピー
                          </>
                        )}
                      </button>
                    </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>QRコードを即座に生成 • データ保存なし • 無料で利用</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
