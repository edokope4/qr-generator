(function () {
	'use strict';

	if (typeof QRCode === 'undefined') {
		return;
	}

	const typeEl = document.getElementById('qrType');
	const sizeEl = document.getElementById('qrSize');
	const sizeLabel = document.getElementById('qrSizeLabel');
	const eccEl = document.getElementById('qrEcc');
	const darkEl = document.getElementById('qrDark');
	const lightEl = document.getElementById('qrLight');
	const outputEl = document.getElementById('qrOutput');
	const placeholder = document.getElementById('qrPlaceholder');
	const payloadPreview = document.getElementById('qrPayloadPreview');
	const errorEl = document.getElementById('qrError');
	const btnDownload = document.getElementById('btnQrDownload');
	const btnCopy = document.getElementById('btnQrCopy');

	const fieldBlocks = {
		text: document.getElementById('qrFieldsText'),
		url: document.getElementById('qrFieldsUrl'),
		wifi: document.getElementById('qrFieldsWifi'),
		email: document.getElementById('qrFieldsEmail'),
		phone: document.getElementById('qrFieldsPhone'),
	};

	const eccMap = {
		L: QRCode.CorrectLevel.L,
		M: QRCode.CorrectLevel.M,
		Q: QRCode.CorrectLevel.Q,
		H: QRCode.CorrectLevel.H,
	};

	let debounceTimer = null;
	let lastDataUrl = '';
	let qrInstance = null;

	function escWifi(str) {
		return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');
	}

	function buildPayload() {
		const type = typeEl.value;

		if (type === 'text') {
			return (document.getElementById('qrText').value || '').trim();
		}
		if (type === 'url') {
			let url = (document.getElementById('qrUrl').value || '').trim();
			if (url && !/^https?:\/\//i.test(url)) {
				url = 'https://' + url;
			}
			return url;
		}
		if (type === 'wifi') {
			const ssid = (document.getElementById('qrWifiSsid').value || '').trim();
			if (!ssid) {
				return '';
			}
			const enc = document.getElementById('qrWifiEnc').value;
			const pass = document.getElementById('qrWifiPass').value || '';
			const hidden = document.getElementById('qrWifiHidden').checked ? 'true' : 'false';
			return 'WIFI:T:' + enc + ';S:' + escWifi(ssid) + ';P:' + escWifi(pass) + ';H:' + hidden + ';;';
		}
		if (type === 'email') {
			const to = (document.getElementById('qrEmailTo').value || '').trim();
			if (!to) {
				return '';
			}
			const sub = (document.getElementById('qrEmailSub').value || '').trim();
			const body = (document.getElementById('qrEmailBody').value || '').trim();
			const params = [];
			if (sub) {
				params.push('subject=' + encodeURIComponent(sub));
			}
			if (body) {
				params.push('body=' + encodeURIComponent(body));
			}
			return 'mailto:' + to + (params.length ? '?' + params.join('&') : '');
		}
		if (type === 'phone') {
			const phone = (document.getElementById('qrPhone').value || '').trim().replace(/\s+/g, '');
			if (!phone) {
				return '';
			}
			return 'tel:' + phone;
		}
		return '';
	}

	function getQrImageDataUrl() {
		const canvas = outputEl.querySelector('canvas');
		if (canvas) {
			return canvas.toDataURL('image/png');
		}
		const img = outputEl.querySelector('img');
		if (img && img.src) {
			return img.src;
		}
		return '';
	}

	function showError(msg) {
		errorEl.textContent = msg;
		errorEl.classList.remove('d-none');
		outputEl.classList.add('d-none');
		outputEl.innerHTML = '';
		placeholder.classList.remove('d-none');
		btnDownload.disabled = true;
		btnCopy.disabled = true;
		lastDataUrl = '';
	}

	function clearError() {
		errorEl.classList.add('d-none');
		errorEl.textContent = '';
	}

	function switchFields() {
		const type = typeEl.value;
		Object.keys(fieldBlocks).forEach(function (key) {
			if (!fieldBlocks[key]) {
				return;
			}
			fieldBlocks[key].classList.toggle('d-none', key !== type);
		});
	}

	function renderQr() {
		const payload = buildPayload();
		payloadPreview.textContent = payload || '—';

		if (!payload) {
			clearError();
			outputEl.classList.add('d-none');
			outputEl.innerHTML = '';
			placeholder.classList.remove('d-none');
			btnDownload.disabled = true;
			btnCopy.disabled = true;
			lastDataUrl = '';
			qrInstance = null;
			return;
		}

		const size = parseInt(sizeEl.value, 10) || 256;
		const correctLevel = eccMap[eccEl.value] || QRCode.CorrectLevel.M;

		try {
			outputEl.innerHTML = '';
			outputEl.classList.remove('d-none');
			placeholder.classList.add('d-none');

			qrInstance = new QRCode(outputEl, {
				text: payload,
				width: size,
				height: size,
				colorDark: darkEl.value,
				colorLight: lightEl.value,
				correctLevel: correctLevel,
			});

			clearError();
			btnDownload.disabled = false;
			btnCopy.disabled = false;

			window.setTimeout(function () {
				lastDataUrl = getQrImageDataUrl();
			}, 150);
		} catch (err) {
			showError(err.message || 'No se pudo generar el código QR.');
		}
	}

	function scheduleRender() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(renderQr, 200);
	}

	function bindInputs(root) {
		const inputs = root.querySelectorAll('input, textarea, select');
		inputs.forEach(function (el) {
			el.addEventListener('input', scheduleRender);
			el.addEventListener('change', scheduleRender);
		});
	}

	typeEl.addEventListener('change', function () {
		switchFields();
		scheduleRender();
	});

	sizeEl.addEventListener('input', function () {
		sizeLabel.textContent = sizeEl.value;
		scheduleRender();
	});

	btnDownload.addEventListener('click', function () {
		const url = lastDataUrl || getQrImageDataUrl();
		if (!url) {
			return;
		}
		const a = document.createElement('a');
		a.href = url;
		a.download = 'qrcode-' + Date.now() + '.png';
		a.click();
	});

	btnCopy.addEventListener('click', function () {
		const canvas = outputEl.querySelector('canvas');
		if (!canvas) {
			alert('Tu navegador no permite copiar la imagen. Usa «Descargar PNG».');
			return;
		}
		canvas.toBlob(function (blob) {
			if (!blob || !navigator.clipboard || !window.ClipboardItem) {
				alert('Tu navegador no permite copiar la imagen. Usa «Descargar PNG».');
				return;
			}
			navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
				.then(function () {
					const orig = btnCopy.innerHTML;
					btnCopy.innerHTML = '<i class="bi bi-check-lg me-1"></i> Copiado';
					setTimeout(function () {
						btnCopy.innerHTML = orig;
					}, 1500);
				})
				.catch(function () {
					alert('No se pudo copiar. Prueba descargar el PNG.');
				});
		}, 'image/png');
	});

	document.querySelectorAll('.qr-fields').forEach(bindInputs);
	bindInputs(document.querySelector('.card-body'));

	switchFields();
	sizeLabel.textContent = sizeEl.value;
	scheduleRender();
})();
