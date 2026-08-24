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
			});
		})();
	});
})();
