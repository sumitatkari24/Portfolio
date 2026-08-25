/* Minimal site script: loader, year, scroll progress, skill fills */
(function(){
	'use strict';

	function safeQuery(sel){ try { return document.querySelector(sel); } catch(e){ return null; } }

	document.addEventListener('DOMContentLoaded', function(){
		var loader = document.getElementById('loader');
		var progress = document.querySelector('.loader-progress span');
		var yearEl = document.getElementById('year');
		if(yearEl) yearEl.textContent = new Date().getFullYear();

		// Animate loader progress to avoid stalling
		if(progress && loader){
			var pct = 0;
			var iv = setInterval(function(){
				pct += Math.floor(Math.random()*12)+8;
				if(pct > 92) pct = 92;
				progress.style.width = pct + '%';
				if(pct >= 92){ clearInterval(iv); }
			}, 120);

			// Ensure loader hides after a short grace period
			setTimeout(function(){
				try{ progress.style.width = '100%'; }catch(e){}
				if(loader){ loader.style.transition = 'opacity 360ms ease'; loader.style.opacity = '0'; setTimeout(function(){ if(loader && loader.parentNode) loader.parentNode.removeChild(loader); },420); }
			}, 900);
		} else if(loader){
			// no progress element: remove loader quickly
			setTimeout(function(){ loader.style.display='none'; }, 800);
		}

		// Scroll progress bar
		var sc = document.getElementById('scrollProgress');
		function updateScroll(){
			if(!sc) return;
			var h = document.documentElement.scrollHeight - window.innerHeight;
			var p = (h > 0) ? (window.scrollY / h) * 100 : 0;
			sc.style.width = p + '%';
		}
		window.addEventListener('scroll', updateScroll, {passive:true});
		updateScroll();

		// Animate skill fills
		try{
			var fills = document.querySelectorAll('.skill-fill[data-percent]');
			fills.forEach(function(f){
				var v = f.getAttribute('data-percent') || '0';
				f.style.width = '0%';
				setTimeout(function(){ f.style.width = v + '%'; }, 600);
			});
		}catch(e){}

		// Contact form handling + Netlify submission
		(function(){
			var form = document.getElementById('contactForm');
			if(!form) return;

			function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

			function setError(id,msg){ var el = document.getElementById(id); if(el) el.textContent = msg; }
			function clearErrors(){ ['error-name','error-email','error-subject','error-message'].forEach(function(i){ setError(i,''); }); }

			form.addEventListener('submit', function(e){
				e.preventDefault();
				clearErrors();
				var name = form.querySelector('[name="name"]').value.trim();
				var email = form.querySelector('[name="email"]').value.trim();
				var subject = form.querySelector('[name="subject"]').value.trim();
				var message = form.querySelector('[name="message"]').value.trim();
				var bot = form.querySelector('[name="bot-field"]').value;
				var ok = true;
				if(bot){ return; } // honeypot triggered
				if(!name){ setError('error-name','Please enter your name.'); ok = false; }
				if(!email || !isEmail(email)){ setError('error-email','Please enter a valid email.'); ok = false; }
				if(!subject){ setError('error-subject','Please enter a subject.'); ok = false; }
				if(!message){ setError('error-message','Please enter a message.'); ok = false; }
				if(!ok) return;

				var submitBtn = form.querySelector('button[type="submit"]');
				var statusEl = document.getElementById('formMessage');
				if(submitBtn) submitBtn.disabled = true;
				if(statusEl){ statusEl.textContent = 'Sending...'; statusEl.classList.remove('form-success'); }

				// Build payload for Netlify
				var data = new FormData(form);
				// Ensure form-name is present
				data.set('form-name', form.getAttribute('name') || 'contact');

				var body = new URLSearchParams();
				for(var pair of data.entries()){ body.append(pair[0], pair[1]); }

				// Submit to Netlify Forms (keeps Netlify form storage)
				fetch('/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: body.toString()
				}).then(function(res){
					if(res.ok){
						if(statusEl){ statusEl.textContent = "Message Sent Successfully! Thank you — I'll get back to you soon."; statusEl.classList.add('form-success'); }
						form.reset();
					} else {
						if(statusEl){ statusEl.textContent = 'Submission failed. Please try again later.'; }
					}
				}).catch(function(){ if(statusEl) statusEl.textContent = 'Submission failed. Please try again later.'; })
				.finally(function(){ if(submitBtn) submitBtn.disabled = false; });

				// Also POST to Netlify Function to send an email (requires SENDGRID_API_KEY in Netlify env)
				try {
					fetch('/.netlify/functions/send-contact-email', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
					}).then(function(r){
						// optional: log or surface errors silently
						if(!r.ok){ console.warn('Email function responded with', r.status); }
					}).catch(function(err){ console.warn('Email function error', err); });
				} catch(e) { console.warn('Email function call failed', e); }
			});
		})();

		// Certificate lightbox modal
		(function(){
			var modal = document.getElementById('certModal');
			var modalImg = document.getElementById('certModalImg');
			var modalCaption = document.getElementById('certModalCaption');
			var closeBtn = document.getElementById('certModalClose');

			function openModal(href, title){
				if(!modal || !modalImg) return;
				modalImg.src = href;
				modalCaption.textContent = title || '';
				modal.setAttribute('aria-hidden','false');
				document.body.style.overflow = 'hidden';
			}
			function closeModal(){
				if(!modal) return;
				modal.setAttribute('aria-hidden','true');
				modalImg.src = '';
				document.body.style.overflow = '';
			}

			document.addEventListener('click', function(e){
				var t = e.target;
				if(t && t.classList && t.classList.contains('cert-view')){
					e.preventDefault();
					var href = t.getAttribute('href');
					var isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(href);
					if(!isImage){
						window.open(href, '_blank', 'noopener,noreferrer');
						return;
					}
					var title = t.closest('.cert-card') ? (t.closest('.cert-card').querySelector('h3') || {}).textContent : '';
					openModal(href, title);
				}
				if(t && (t.id === 'certModal' || t.id === 'certModalClose' || t.classList.contains('cert-modal'))){
					closeModal();
				}
			});
			document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeModal(); } });
		})();

		// Load certificates from manifest if present and render into all .cert-grid blocks
		(function(){
			var grids = document.querySelectorAll('.cert-grid');
			if(!grids.length) return;
			fetch('assets/certificates/index.json').then(function(res){
				if(!res.ok) return null;
				return res.json();
			}).then(function(list){
				if(!list || !Array.isArray(list)) return;
				grids.forEach(function(certGrid){
					certGrid.innerHTML = '';
					list.forEach(function(c){
						var div = document.createElement('div');
						div.className = 'cert-card card';

					var head = document.createElement('div'); head.className = 'cert-card-head';
					var badge = document.createElement('span'); badge.className = 'cert-badge'; badge.textContent = c.platform || c.issuer || 'Certificate';
					var year = document.createElement('span'); year.className = 'cert-year'; year.textContent = c.year || '2025';
					head.appendChild(badge); head.appendChild(year);

					var h3 = document.createElement('h3'); h3.textContent = c.title || 'Certificate';
					var p1 = document.createElement('p'); p1.className='muted cert-meta'; p1.textContent = 'Issued by: ' + (c.issuer || '—');
					var p2 = document.createElement('p'); p2.className = 'cert-desc'; p2.textContent = c.description || '';

					var href = 'assets/certificates/' + (c.filename || c.file || 'placeholder-cert.png');
					var a = document.createElement('a'); a.className='btn btn-sm cert-view'; a.href = href; a.rel='noopener'; a.textContent = /\.(pdf)$/i.test(href) ? 'Open Certificate' : 'View Certificate';

					div.appendChild(head); div.appendChild(h3); div.appendChild(p1); div.appendChild(p2); div.appendChild(a);
						certGrid.appendChild(div);
					});
				});
			}).catch(function(){ /* ignore manifest load errors */ });
		})();

		// Client-side upload preview for certificates (non-persistent)
		(function(){
			var upload = document.getElementById('certUpload');
			var certGrid = document.querySelector('.cert-grid');
			if(!upload || !certGrid) return;
			upload.addEventListener('change', function(e){
				var files = Array.from(upload.files || []);
				if(!files.length) return;
				certGrid.innerHTML = '';
				files.forEach(function(f){
					var url = URL.createObjectURL(f);
					var div = document.createElement('div');
					div.className = 'cert-card card';
					var head = document.createElement('div'); head.className='cert-card-head';
					var badge = document.createElement('span'); badge.className='cert-badge'; badge.textContent = 'Uploaded Certificate';
					var year = document.createElement('span'); year.className='cert-year'; year.textContent = 'New';
					head.appendChild(badge); head.appendChild(year);
					var h3 = document.createElement('h3'); h3.textContent = f.name.replace(/\.[^/.]+$/, '');
					var p1 = document.createElement('p'); p1.className='muted cert-meta'; p1.textContent = 'Custom upload';
					var p2 = document.createElement('p'); p2.className='cert-desc'; p2.textContent = 'Uploaded certificate preview ready to open in the modal.';
					var a = document.createElement('a'); a.className='btn btn-sm cert-view'; a.href = url; a.rel='noopener'; a.textContent = /\.(pdf)$/i.test(f.name) ? 'Open Certificate' : 'View Certificate';
					div.appendChild(head); div.appendChild(h3); div.appendChild(p1); div.appendChild(p2); div.appendChild(a);
					certGrid.appendChild(div);
				});
			});
		})();
	});
})();
