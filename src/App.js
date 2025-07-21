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
