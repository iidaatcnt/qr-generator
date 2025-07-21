import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check, Upload, Search, Grid } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "QR Code Generator & Reader",
    "appDescription": "Generate and decode QR codes for URLs, text, and contact information",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "decodeTab": "Decode",
    "batchTab": "Batch",
    "enterUrl": "Enter URL",
    "enterText": "Enter Text",
    "contactInformation": "Contact Information",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com or https://example.com",
    "urlHelp": "Enter a website URL. If you don't include http://, we'll add https:// automatically.",
    "textContent": "Text Content",
    "textPlaceholder": "Enter any text to generate QR code...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Email Address",
    "emailPlaceholder": "john.doe@example.com",
    "organization": "Organization",
    "organizationPlaceholder": "Company Name",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear All Fields",
    "generatedQrCode": "Generated QR Code",
    "scanQrCode": "Scan this QR code with your device",
    "fillFormPrompt": "Fill in the form to generate your QR code",
    "download": "Download",
    "copyData": "Copy Data",
    "copied": "Copied!",
    "qrCodeData": "QR Code Data:",
    "footerText": "Generate QR codes instantly • No data stored • Free to use",
    "qrCodeAlt": "Generated QR Code",
    "decodeQrCode": "Decode QR Code",
    "uploadImage": "Upload QR Code Image",
    "dragDropText": "Drag and drop a QR code image here, or click to select",
    "supportedFormats": "Supported formats: PNG, JPG, JPEG, GIF, WebP",
    "decodedResult": "Decoded Result",
    "noQrFound": "No QR code found in the image",
    "uploadError": "Error uploading file. Please try again.",
    "decodeError": "Error decoding QR code. Please try a different image.",
    "copyResult": "Copy Result",
    "clearImage": "Clear Image",
    "batchGeneration": "Batch QR Generation",
    "batchInstructions": "Enter data in CSV format: filename,text content (one per line)",
    "batchPlaceholder": "qr1,https://example.com\nqr2,Hello World\nqr3,Contact Info",
    "generateBatch": "Generate Batch",
    "downloadAll": "Download All",
    "downloadIndividual": "Download",
    "batchResults": "Generated QR Codes",
    "qrCodesGenerated": "QR codes generated",
    "invalidFormat": "Invalid format. Please use: filename,content",
    "emptyBatch": "Please enter at least one item to generate"
  },
  "es-ES": {
    "appTitle": "Generador y Lector de Códigos QR",
    "appDescription": "Genera y decodifica códigos QR para URLs, texto e información de contacto",
    "urlTab": "URL",
    "textTab": "Texto",
    "contactTab": "Contacto",
    "decodeTab": "Decodificar",
    "batchTab": "Lote",
    "enterUrl": "Ingresa URL",
    "enterText": "Ingresa Texto",
    "contactInformation": "Información de Contacto",
    "websiteUrl": "URL del Sitio Web",
    "urlPlaceholder": "ejemplo.com o https://ejemplo.com",
    "urlHelp": "Ingresa una URL de sitio web. Si no incluyes http://, agregaremos https:// automáticamente.",
    "textContent": "Contenido de Texto",
    "textPlaceholder": "Ingresa cualquier texto para generar código QR...",
    "firstName": "Nombre",
    "firstNamePlaceholder": "Juan",
    "lastName": "Apellido",
    "lastNamePlaceholder": "Pérez",
    "phoneNumber": "Número de Teléfono",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Dirección de Correo",
    "emailPlaceholder": "juan.perez@ejemplo.com",
    "organization": "Organización",
    "organizationPlaceholder": "Nombre de la Empresa",
    "website": "Sitio Web",
    "websitePlaceholder": "https://ejemplo.com",
    "clearAllFields": "Limpiar Todos los Campos",
    "generatedQrCode": "Código QR Generado",
    "scanQrCode": "Escanea este código QR con tu dispositivo",
    "fillFormPrompt": "Completa el formulario para generar tu código QR",
    "download": "Descargar",
    "copyData": "Copiar Datos",
    "copied": "¡Copiado!",
    "qrCodeData": "Datos del Código QR:",
    "footerText": "Genera códigos QR al instante • No se almacenan datos • Gratis",
    "qrCodeAlt": "Código QR Generado",
    "decodeQrCode": "Decodificar Código QR",
    "uploadImage": "Subir Imagen de Código QR",
    "dragDropText": "Arrastra y suelta una imagen de código QR aquí, o haz clic para seleccionar",
    "supportedFormats": "Formatos soportados: PNG, JPG, JPEG, GIF, WebP",
    "decodedResult": "Resultado Decodificado",
    "noQrFound": "No se encontró código QR en la imagen",
    "uploadError": "Error al subir archivo. Por favor intenta de nuevo.",
    "decodeError": "Error al decodificar código QR. Por favor intenta con una imagen diferente.",
    "copyResult": "Copiar Resultado",
    "clearImage": "Limpiar Imagen",
    "batchGeneration": "Generación en Lote de Códigos QR",
    "batchInstructions": "Ingresa datos en formato CSV: nombrearchivo,contenido texto (uno por línea)",
    "batchPlaceholder": "qr1,https://ejemplo.com\nqr2,Hola Mundo\nqr3,Info de Contacto",
    "generateBatch": "Generar Lote",
    "downloadAll": "Descargar Todo",
    "downloadIndividual": "Descargar",
    "batchResults": "Códigos QR Generados",
    "qrCodesGenerated": "códigos QR generados",
    "invalidFormat": "Formato inválido. Por favor usa: nombrearchivo,contenido",
    "emptyBatch": "Por favor ingresa al menos un elemento para generar"
  },
  "ja-JP": {
    "appTitle": "QRコードジェネレーター＆リーダー",
    "appDescription": "URL、テキスト、連絡先情報のQRコードを生成・解読",
    "urlTab": "URL",
    "textTab": "テキスト",
    "contactTab": "連絡先",
    "decodeTab": "解読",
    "batchTab": "一括",
    "enterUrl": "URLを入力",
    "enterText": "テキストを入力",
    "contactInformation": "連絡先情報",
    "websiteUrl": "ウェブサイトURL",
    "urlPlaceholder": "example.com または https://example.com",
    "urlHelp": "ウェブサイトのURLを入力してください。http://を含めない場合、https://を自動で追加します。",
    "textContent": "テキスト内容",
    "textPlaceholder": "QRコードを生成するテキストを入力...",
    "firstName": "名",
    "firstNamePlaceholder": "太郎",
    "lastName": "姓",
    "lastNamePlaceholder": "山田",
    "phoneNumber": "電話番号",
    "phonePlaceholder": "+81 90-1234-5678",
    "emailAddress": "メールアドレス",
    "emailPlaceholder": "taro.yamada@example.com",
    "organization": "組織",
    "organizationPlaceholder": "会社名",
    "website": "ウェブサイト",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "全てクリア",
    "generatedQrCode": "生成されたQRコード",
    "scanQrCode": "デバイスでこのQRコードをスキャンしてください",
    "fillFormPrompt": "フォームを入力してQRコードを生成してください",
    "download": "ダウンロード",
    "copyData": "データをコピー",
    "copied": "コピーしました！",
    "qrCodeData": "QRコードデータ:",
    "footerText": "QRコードを即座に生成 • データ保存なし • 無料で利用",
    "qrCodeAlt": "生成されたQRコード",
    "decodeQrCode": "QRコードを解読",
    "uploadImage": "QRコード画像をアップロード",
    "dragDropText": "QRコード画像をここにドラッグ&ドロップするか、クリックして選択",
    "supportedFormats": "対応形式: PNG, JPG, JPEG, GIF, WebP",
    "decodedResult": "解読結果",
    "noQrFound": "画像内にQRコードが見つかりません",
    "uploadError": "ファイルアップロードエラー。再度お試しください。",
    "decodeError": "QRコード解読エラー。別の画像をお試しください。",
    "copyResult": "結果をコピー",
    "clearImage": "画像をクリア",
    "batchGeneration": "一括QRコード生成",
    "batchInstructions": "CSV形式でデータを入力: ファイル名,テキスト内容（1行に1つ）",
    "batchPlaceholder": "qr1,https://example.com\nqr2,Hello World\nqr3,連絡先情報",
    "generateBatch": "一括生成",
    "downloadAll": "全てダウンロード",
    "downloadIndividual": "ダウンロード",
    "batchResults": "生成されたQRコード",
    "qrCodesGenerated": "個のQRコードが生成されました",
    "invalidFormat": "無効な形式。使用方法: ファイル名,内容",
    "emptyBatch": "生成するアイテムを少なくとも1つ入力してください"
  }
};

const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [decodedResult, setDecodedResult] = useState('');
  const [decodeError, setDecodeError] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const qrContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Form states for different types
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });
  const [logoEnabled, setLogoEnabled] = useState(true);

  // Create QR Canvas function
  const createQRCanvas = async (text, size) => {
    if (!size) {
      size = 300;
    }
    
    try {
      // Load QRious library if not already loaded
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Create canvas element
      const canvas = document.createElement('canvas');
      
      // Generate QR code
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: size,
        background: 'white',
        foreground: 'black',
        level: logoEnabled ? 'H' : 'M' // ロゴありなら高エラー訂正
      });
      
      // Add smile emoji in the center (if enabled)
      if (logoEnabled) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const logoSize = Math.floor(size * 0.10); // サイズを10%に縮小
        
        // Draw white background circle for logo
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize/2 + 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border for better contrast
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw smile emoji
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

  const createQR = async (text) => {
    if (!qrContainerRef.current) return;
    
    try {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';
      
      const canvas = await createQRCanvas(text);
      if (canvas) {
        // Style the canvas
        canvas.className = 'w-full h-auto rounded-xl shadow-lg bg-white';
        canvas.style.maxWidth = '300px';
        canvas.style.height = 'auto';
        
        qrContainerRef.current.appendChild(canvas);
      } else {
        generateFallbackQR(text);
      }
      
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text);
    }
  };

  // QR Code generation using QRious library via CDN
  const generateQRCode = async (text) => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    try {
      await createQR(text);
    } catch (error) {
      console.error('Error loading QR library:', error);
      // Fallback to Google Charts API
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text) => {
    if (!qrContainerRef.current) return;
    
    // Clear previous content
    qrContainerRef.current.innerHTML = '';
    
    // Create img element for fallback
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodedData + '&choe=UTF-8';
    img.alt = t('qrCodeAlt');
    img.className = 'w-full h-auto rounded-xl shadow-lg bg-white p-4';
    img.style.maxWidth = '300px';
    img.style.height = 'auto';
    
    // Add error handling for the fallback image
    img.onerror = () => {
      // If Google Charts also fails, try QR Server API
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodedData + '&format=png&margin=10';
    };
    
    qrContainerRef.current.appendChild(img);
  };

  // 改善されたQRコード解読機能
  const decodeQRCode = async (imageFile) => {
    setIsDecoding(true);
    setDecodeError('');
    setDecodedResult('');
    
    try {
      // Load jsQR library if not already loaded
      if (!window.jsQR) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      // Create image element
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // 画像サイズの最適化
        const maxSize = 1000;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 高品質な画像描画
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);
        
        // 複数の画像処理を試行
        const tryDecode = (imageData) => {
          return window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
        };
        
        // オリジナル画像で試行
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = tryDecode(imageData);
        
        if (!code) {
          // コントラスト調整
          const data = imageData.data;
          const contrast = 1.5;
          const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
          
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
          }
          
          ctx.putImageData(imageData, 0, 0);
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          code = tryDecode(imageData);
        }
        
        if (!code) {
          // グレースケール変換
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
          
          ctx.putImageData(imageData, 0, 0);
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          code = tryDecode(imageData);
        }
        
        if (!code) {
          // 異なる反転設定で試行
          code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
        }
        
        if (code) {
          setDecodedResult(code.data);
        } else {
          setDecodeError(t('noQrFound'));
        }
        setIsDecoding(false);
      };
      
      img.onerror = () => {
        setDecodeError(t('uploadError'));
        setIsDecoding(false);
      };
      
      // Load image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
      
    } catch (error) {
      console.error('Error decoding QR code:', error);
      setDecodeError(t('decodeError'));
      setIsDecoding(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      decodeQRCode(file);
    }
  };

  // Handle drag and drop
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

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setDecodedResult('');
    setDecodeError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Batch QR generation functions
  const parseBatchInput = (input) => {
    const lines = input.trim().split('\n').filter(line => line.trim());
    const results = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const commaIndex = line.indexOf(',');
      
      if (commaIndex === -1 || commaIndex === 0 || commaIndex === line.length - 1) {
        throw new Error(t('invalidFormat') + ' (Line ' + (i + 1).toString() + ')');
      }
      
      const filename = line.substring(0, commaIndex).trim();
      const content = line.substring(commaIndex + 1).trim();
      
      if (!filename || !content) {
        throw new Error(t('invalidFormat') + ' (Line ' + (i + 1).toString() + ')');
      }
      
      results.push({ filename: filename, content: content });
    }
    
    return results;
  };

  const generateBatchQRCodes = async () => {
    if (!batchInput.trim()) {
      alert(t('emptyBatch'));
      return;
    }

    setIsGeneratingBatch(true);
    setBatchResults([]);

    try {
      const items = parseBatchInput(batchInput);
      const results = [];

      for (const item of items) {
        const canvas = await createQRCanvas(item.content, 200);
        if (canvas) {
          // Convert canvas to data URL for storage
          const dataURL = canvas.toDataURL('image/png');
          results.push({
            filename: item.filename,
            content: item.content,
            dataURL: dataURL
          });
        }
      }

      setBatchResults(results);
    } catch (error) {
      alert(error.message);
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

  const downloadAllQRCodes = () => {
    batchResults.forEach((item, index) => {
      setTimeout(() => {
        downloadBatchQR(item);
      }, index * 100); // Stagger downloads slightly
    });
  };

  const clearBatchResults = () => {
    setBatchResults([]);
    setBatchInput('');
  };

  const formatUrl = (url) => {
    if (!url.trim()) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact) => {
    const vcard = 'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + contact.firstName + ' ' + contact.lastName + '\n' +
      'N:' + contact.lastName + ';' + contact.firstName + ';;;\n' +
      'ORG:' + contact.organization + '\n' +
      'TEL:' + contact.phone + '\n' +
      'EMAIL:' + contact.email + '\n' +
      'URL:' + contact.url + '\n' +
      'END:VCARD';
    return vcard;
  };

  useEffect(() => {
    // Don't auto-generate for batch or decode tabs
    if (activeTab === 'batch' || activeTab === 'decode') {
      return;
    }

    let data = '';
    
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
      default:
        data = '';
    }
    
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo, logoEnabled]); // logoEnabledを依存配列に追加

  const downloadQRCode = () => {
    if (!qrData) return;
    
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    
    if (canvas) {
      // Download from canvas
      const link = document.createElement('a');
      link.download = 'qr-code-' + activeTab + '.png';
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      // Download from image
      const link = document.createElement('a');
      link.download = 'qr-code-' + activeTab + '.png';
      link.href = img.src;
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

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      url: ''
    });
    setBatchInput('');
    setBatchResults([]);
    setLogoEnabled(true); // ロゴ設定もリセット
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User },
    { id: 'batch', label: t('batchTab'), icon: Grid },
    { id: 'decode', label: t('decodeTab'), icon: Search }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('appTitle')}
          </h1>
          <p className="text-gray-600 text-lg">{t('appDescription')}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
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
              {/* Input Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {activeTab === 'url' && t('enterUrl')}
                  {activeTab === 'text' && t('enterText')}
                  {activeTab === 'contact' && t('contactInformation')}
                  {activeTab === 'batch' && t('batchGeneration')}
                  {activeTab === 'decode' && t('decodeQrCode')}
                </h2>

                {/* URL Input */}
                {activeTab === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('websiteUrl')}
                    </label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t('urlPlaceholder')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('urlHelp')}
                    </p>
                  </div>
                )}

                {/* Text Input */}
                {activeTab === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('textContent')}
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('textPlaceholder')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                )}

                {/* Contact Input */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('firstName')}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                          placeholder={t('firstNamePlaceholder')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('lastName')}
                        </label>
                        <input
                          type="text"
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                          placeholder={t('lastNamePlaceholder')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phoneNumber')}
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        placeholder={t('phonePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('emailAddress')}
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                        placeholder={t('emailPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('organization')}
                      </label>
                      <input
                        type="text"
                        value={contactInfo.organization}
                        onChange={(e) => setContactInfo({...contactInfo, organization: e.target.value})}
                        placeholder={t('organizationPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('website')}
                      </label>
                      <input
                        type="url"
                        value={contactInfo.url}
                        onChange={(e) => setContactInfo({...contactInfo, url: e.target.value})}
                        placeholder={t('websitePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                )}

                {/* Batch Input */}
                {activeTab === 'batch' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('batchInstructions')}
                      </label>
                      <textarea
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        placeholder={t('batchPlaceholder')}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={generateBatchQRCodes}
                        disabled={isGeneratingBatch || !batchInput.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingBatch ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Grid className="w-4 h-4" />
                            {t('generateBatch')}
                          </>
                        )}
                      </button>
                      
                      {batchResults.length > 0 && (
                        <button
                          onClick={downloadAllQRCodes}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium"
                        >
                          <Download className="w-4 h-4" />
                          {t('downloadAll')}
                        </button>
                      )}
                      
                      <button
                        onClick={clearBatchResults}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                    
                    {batchResults.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {t('batchResults')} ({batchResults.length} {t('qrCodesGenerated')})
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
                                {t('downloadIndividual')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Decode Input */}
                {activeTab === 'decode' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('uploadImage')}
                      </label>
                      
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors duration-200 cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">{t('dragDropText')}</p>
                        <p className="text-xs text-gray-500">{t('supportedFormats')}</p>
                        
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
                            <span className="text-sm text-gray-600">
                              {uploadedImage.name}
                            </span>
                            <button
                              onClick={clearUploadedImage}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              {t('clearImage')}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {isDecoding && (
                        <div className="mt-4 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <p className="text-sm text-gray-600 mt-2">Decoding...</p>
                        </div>
                      )}
                      
                      {decodeError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{decodeError}</p>
                        </div>
                      )}
                      
                      {decodedResult && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('decodedResult')}</h3>
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
                                  {t('copied')}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  {t('copyResult')}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab !== 'decode' && activeTab !== 'batch' && (
                  <button
                    onClick={resetForm}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    {t('clearAllFields')}
                  </button>
                )}
              </div>

              {/* QR Code Display Section */}
              {activeTab !== 'decode' && activeTab !== 'batch' && (
                <div className="flex flex-col items-center space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800">{t('generatedQrCode')}</h2>
                  
                  {/* Logo Toggle */}
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
                          {/* QR code will be dynamically inserted here */}
                        </div>
                        <p className="text-sm text-gray-600 mt-4">
                          {t('scanQrCode')}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {t('fillFormPrompt')}
                        </p>
                      </div>
                    )}
                  </div>

                  {qrData && (
                    <div className="flex gap-4 w-full max-w-sm">
                      <button
                        onClick={downloadQRCode}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        {t('download')}
                      </button>
                      
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            {t('copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t('copyData')}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {qrData && (
                    <div className="w-full max-w-sm">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{t('qrCodeData')}</h3>
                      <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words">{qrData}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t('footerText')}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
