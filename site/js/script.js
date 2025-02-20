"use strict";
(function () {
	// Global variables
	var
			userAgent = navigator.userAgent.toLowerCase(),
			initialDate = new Date(),

			$document = $(document),
			$window = $(window),
			$html = $("html"),
			$body = $("body"),

			isDesktop = $html.hasClass("desktop"),
			isIE = userAgent.indexOf("msie") !== -1 ? parseInt(userAgent.split("msie")[1], 10) : userAgent.indexOf("trident") !== -1 ? 11 : userAgent.indexOf("edge") !== -1 ? 12 : false,
			isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
			windowReady = false,
			isNoviBuilder = false,
			livedemo = true,

			plugins = {
				customToggle: $("[data-custom-toggle]"),
				captcha: $('.recaptcha'),
				copyrightYear: $(".copyright-year"),
				owl: $(".owl-carousel"),
				preloader: $(".preloader"),
				rdNavbar: $(".rd-navbar"),
				rdMailForm: $(".rd-mailform"),
				rdInputLabel: $(".form-label"),
				regula: $("[data-constraints]"),
				wow: $(".wow")
			};

	/**
	 * @desc Check the element was been scrolled into the view
	 * @param {object} elem - jQuery object
	 * @return {boolean}
	 */
	function isScrolledIntoView(elem) {
		if (isNoviBuilder) return true;
		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}

	/**
	 * @desc Calls a function when element has been scrolled into the view
	 * @param {object} element - jQuery object
	 * @param {function} func - init function
	 */
	function lazyInit(element, func) {
		var scrollHandler = function () {
			if (( !element.hasClass('lazy-loaded') && ( isScrolledIntoView(element) ) )) {
				func.call();
				element.addClass('lazy-loaded');
			}
		};

		scrollHandler();
		$window.on('scroll', scrollHandler);
	}

	// Initialize scripts that require a loaded page
	$window.on('load', function () {
		// Page loader & Page transition
		if (plugins.preloader.length && !isNoviBuilder) {
			pageTransition({
				target: document.querySelector('.page'),
				delay: 0,
				duration: 500,
				classIn: 'fadeIn',
				classOut: 'fadeOut',
				classActive: 'animated',
				conditions: function (event, link) {
					return !/(\#|callto:|tel:|mailto:|:\/\/)/.test(link) && !event.currentTarget.hasAttribute('data-lightgallery');
				},
				onTransitionStart: function (options) {
					setTimeout(function () {
						plugins.preloader.removeClass('loaded');
					}, options.duration * .75);
				},
				onReady: function () {
					plugins.preloader.addClass('loaded');
					windowReady = true;
				}
			});
		}
	});

	// Initialize scripts that require a finished document
	$(function () {
		isNoviBuilder = window.xMode;

		/**
		 * @desc Initialize owl carousel plugin
		 * @param {object} c - carousel jQuery object
		 */
		function initOwlCarousel(c) {
			var aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"],
					values = [0, 576, 768, 992, 1200, 1600],
					responsive = {};

			for (var j = 0; j < values.length; j++) {
				responsive[values[j]] = {};
				for (var k = j; k >= -1; k--) {
					if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
						responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
					}
					if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
						responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
					}
					if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
						responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
					}
				}
			}

			// Enable custom pagination
			if (c.attr('data-dots-custom')) {
				c.on("initialized.owl.carousel", function (event) {
					var carousel = $(event.currentTarget),
							customPag = $(carousel.attr("data-dots-custom")),
							active = 0;

					if (carousel.attr('data-active')) {
						active = parseInt(carousel.attr('data-active'), 10);
					}

					carousel.trigger('to.owl.carousel', [active, 300, true]);
					customPag.find("[data-owl-item='" + active + "']").addClass("active");

					customPag.find("[data-owl-item]").on('click', function (e) {
						e.preventDefault();
						carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
					});

					carousel.on("translate.owl.carousel", function (event) {
						customPag.find(".active").removeClass("active");
						customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
					});
				});
			}

			c.owlCarousel({
				autoplay: isNoviBuilder ? false : c.attr("data-autoplay") === "true",
				loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
				items: 1,
				center: c.attr("data-center") === "true",
				dotsContainer: c.attr("data-pagination-class") || false,
				navContainer: c.attr("data-navigation-class") || false,
				mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
				nav: c.attr("data-nav") === "true",
				dots: c.attr("data-dots") === "true",
				dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
				animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
				animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
				responsive: responsive,
				navText: c.attr("data-nav-text") ? $.parseJSON(c.attr("data-nav-text")) : [],
				navClass: c.attr("data-nav-class") ? $.parseJSON(c.attr("data-nav-class")) : ['owl-prev', 'owl-next']
			});
		}

		/**
		 * @desc Attach form validation to elements
		 * @param {object} elements - jQuery object
		 */
		function attachFormValidator(elements) {
			// Custom validator - phone number
			regula.custom({
				name: 'PhoneNumber',
				defaultMessage: 'Invalid phone number format',
				validator: function () {
					if (this.value === '') return true;
					else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value);
				}
			});

			for (var i = 0; i < elements.length; i++) {
				var o = $(elements[i]), v;
				o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
				v = o.parent().find(".form-validation");
				if (v.is(":last-child")) o.addClass("form-control-last-child");
			}

			elements.on('input change propertychange blur', function (e) {
				var $this = $(this), results;

				if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
				if ($this.parents('.rd-mailform').hasClass('success')) return;

				if (( results = $this.regula('validate') ).length) {
					for (i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}).regula('bind');

			var regularConstraintsMessages = [
				{
					type: regula.Constraint.Required,
					newMessage: "The text field is required."
				},
				{
					type: regula.Constraint.Email,
					newMessage: "The email is not a valid email."
				},
				{
					type: regula.Constraint.Numeric,
					newMessage: "Only numbers are required"
				},
				{
					type: regula.Constraint.Selected,
					newMessage: "Please choose an option."
				}
			];


			for (var i = 0; i < regularConstraintsMessages.length; i++) {
				var regularConstraint = regularConstraintsMessages[i];

				regula.override({
					constraintType: regularConstraint.type,
					defaultMessage: regularConstraint.newMessage
				});
			}
		}

		/**
		 * @desc Check if all elements pass validation
		 * @param {object} elements - object of items for validation
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function isValidated(elements, captcha) {
			var results, errors = 0;

			if (elements.length) {
				for (var j = 0; j < elements.length; j++) {

					var $input = $(elements[j]);
					if ((results = $input.regula('validate')).length) {
						for (k = 0; k < results.length; k++) {
							errors++;
							$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
						}
					} else {
						$input.siblings(".form-validation").text("").parent().removeClass("has-error")
					}
				}

				if (captcha) {
					if (captcha.length) {
						return validateReCaptcha(captcha) && errors === 0
					}
				}

				return errors === 0;
			}
			return true;
		}

		/**
		 * @desc Validate google reCaptcha
		 * @param {object} captcha - captcha object for validation
		 * @return {boolean}
		 */
		function validateReCaptcha(captcha) {
			var captchaToken = captcha.find('.g-recaptcha-response').val();

			if (captchaToken.length === 0) {
				captcha
				.siblings('.form-validation')
				.html('Please, prove that you are not robot.')
				.addClass('active');
				captcha
				.closest('.form-wrap')
				.addClass('has-error');

				captcha.on('propertychange', function () {
					var $this = $(this),
							captchaToken = $this.find('.g-recaptcha-response').val();

					if (captchaToken.length > 0) {
						$this
						.closest('.form-wrap')
						.removeClass('has-error');
						$this
						.siblings('.form-validation')
						.removeClass('active')
						.html('');
						$this.off('propertychange');
					}
				});

				return false;
			}

			return true;
		}

		/**
		 * @desc Initialize Google reCaptcha
		 */
		window.onloadCaptchaCallback = function () {
			for (var i = 0; i < plugins.captcha.length; i++) {
				var $capthcaItem = $(plugins.captcha[i]);

				grecaptcha.render(
						$capthcaItem.attr('id'),
						{
							sitekey: $capthcaItem.attr('data-sitekey'),
							size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
							theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
							callback: function (e) {
								$('.recaptcha').trigger('propertychange');
							}
						}
				);
				$capthcaItem.after("<span class='form-validation'></span>");
			}
		};

		// Google ReCaptcha
		if (plugins.captcha.length) {
			$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
		}

		// Additional class on html if mac os.
		if (navigator.platform.match(/(Mac)/i)) {
			$html.addClass("mac-os");
		}

		// Adds some loosing functionality to IE browsers (IE Polyfills)
		if (isIE) {
			if (isIE === 12) $html.addClass("ie-edge");
			if (isIE === 11) $html.addClass("ie-11");
			if (isIE < 10) $html.addClass("lt-ie-10");
			if (isIE < 11) $html.addClass("ie-10");
		}

		// Copyright Year (Evaluates correct copyright year)
		if (plugins.copyrightYear.length) {
			plugins.copyrightYear.text(initialDate.getFullYear());
		}

		// UI To Top
		if (isDesktop && !isNoviBuilder) {
			$().UItoTop({
				easingType: 'easeOutQuad',
				containerClass: 'ui-to-top fa fa-angle-up'
			});
		}

		// RD Navbar
		if (plugins.rdNavbar.length) {
			var aliaces, i, j, len, value, values, responsiveNavbar;

			aliaces = ["-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-"];
			values = [0, 576, 768, 992, 1200, 1600];
			responsiveNavbar = {};

			for (i = j = 0, len = values.length; j < len; i = ++j) {
				value = values[i];
				if (!responsiveNavbar[values[i]]) {
					responsiveNavbar[values[i]] = {};
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'layout')) {
					responsiveNavbar[values[i]].layout = plugins.rdNavbar.attr('data' + aliaces[i] + 'layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout')) {
					responsiveNavbar[values[i]]['deviceLayout'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'device-layout');
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on')) {
					responsiveNavbar[values[i]]['focusOnHover'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'hover-on') === 'true';
				}
				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height')) {
					responsiveNavbar[values[i]]['autoHeight'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'auto-height') === 'true';
				}

				if (isNoviBuilder) {
					responsiveNavbar[values[i]]['stickUp'] = false;
				} else if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up')) {
					responsiveNavbar[values[i]]['stickUp'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up') === 'true';
				}

				if (plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset')) {
					responsiveNavbar[values[i]]['stickUpOffset'] = plugins.rdNavbar.attr('data' + aliaces[i] + 'stick-up-offset');
				}
			}


			plugins.rdNavbar.RDNavbar({
				anchorNav: !isNoviBuilder,
				stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
				responsive: responsiveNavbar,
				callbacks: {
					onStuck: function () {
						var navbarSearch = this.$element.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
						}
					},
					onDropdownOver: function () {
						return !isNoviBuilder;
					},
					onUnstuck: function () {
						if (this.$clone === null)
							return;

						var navbarSearch = this.$clone.find('.rd-search input');

						if (navbarSearch) {
							navbarSearch.val('').trigger('propertychange');
							navbarSearch.trigger('blur');
						}

					}
				}
			});


			if (plugins.rdNavbar.attr("data-body-class")) {
				document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
			}
		}

		// Owl carousel
		if (plugins.owl.length) {
			for (var i = 0; i < plugins.owl.length; i++) {
				var c = $(plugins.owl[i]);
				plugins.owl[i].owl = c;

				initOwlCarousel(c);
			}
		}

		// WOW
		if ($html.hasClass("wow-animation") && plugins.wow.length && !isNoviBuilder && isDesktop) {
			new WOW().init();
		}

		// RD Input Label
		if (plugins.rdInputLabel.length) {
			plugins.rdInputLabel.RDInputLabel();
		}

		// Regula
		if (plugins.regula.length) {
			attachFormValidator(plugins.regula);
		}

		// RD Mailform
		if (plugins.rdMailForm.length) {
			var i, j, k,
					msg = {
						'MF000': 'Successfully sent!',
						'MF001': 'Recipients are not set!',
						'MF002': 'Form will not work locally!',
						'MF003': 'Please, define email field in your form!',
						'MF004': 'Please, define type of your form!',
						'MF254': 'Something went wrong with PHPMailer!',
						'MF255': 'Aw, snap! Something went wrong.'
					};

			for (i = 0; i < plugins.rdMailForm.length; i++) {
				var $form = $(plugins.rdMailForm[i]),
						formHasCaptcha = false;

				$form.attr('novalidate', 'novalidate').ajaxForm({
					data: {
						"form-type": $form.attr("data-form-type") || "contact",
						"counter": i
					},
					beforeSubmit: function (arr, $form, options) {
						if (isNoviBuilder)
							return;

						var form = $(plugins.rdMailForm[this.extraData.counter]),
								inputs = form.find("[data-constraints]"),
								output = $("#" + form.attr("data-form-output")),
								captcha = form.find('.recaptcha'),
								captchaFlag = true;

						output.removeClass("active error success");

						if (isValidated(inputs, captcha)) {

							// veify reCaptcha
							if (captcha.length) {
								var captchaToken = captcha.find('.g-recaptcha-response').val(),
										captchaMsg = {
											'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
											'CPT002': 'Something wrong with google reCaptcha'
										};

								formHasCaptcha = true;

								$.ajax({
									method: "POST",
									url: "bat/reCaptcha.php",
									data: {'g-recaptcha-response': captchaToken},
									async: false
								})
								.done(function (responceCode) {
									if (responceCode !== 'CPT000') {
										if (output.hasClass("snackbars")) {
											output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

											setTimeout(function () {
												output.removeClass("active");
											}, 3500);

											captchaFlag = false;
										} else {
											output.html(captchaMsg[responceCode]);
										}

										output.addClass("active");
									}
								});
							}

							if (!captchaFlag) {
								return false;
							}

							form.addClass('form-in-process');

							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
								output.addClass("active");
							}
						} else {
							return false;
						}
					},
					error: function (result) {
						if (isNoviBuilder)
							return;

						var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
								form = $(plugins.rdMailForm[this.extraData.counter]);

						output.text(msg[result]);
						form.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
						}
					},
					success: function (result) {
						if (isNoviBuilder)
							return;

						var form = $(plugins.rdMailForm[this.extraData.counter]),
								output = $("#" + form.attr("data-form-output")),
								select = form.find('select');

						form
						.addClass('success')
						.removeClass('form-in-process');

						if (formHasCaptcha) {
							grecaptcha.reset();
						}

						result = result.length === 5 ? result : 'MF255';
						output.text(msg[result]);

						if (result === "MF000") {
							if (output.hasClass("snackbars")) {
								output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active success");
							}
						} else {
							if (output.hasClass("snackbars")) {
								output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
							} else {
								output.addClass("active error");
							}
						}

						form.clearForm();

						if (select.length) {
							select.select2("val", "");
						}

						form.find('input, textarea').trigger('blur');

						setTimeout(function () {
							output.removeClass("active error success");
							form.removeClass('success');
						}, 3500);
					}
				});
			}
		}

		// Custom Toggles
		if (plugins.customToggle.length) {
			for (var i = 0; i < plugins.customToggle.length; i++) {
				var $this = $(plugins.customToggle[i]);

				$this.on('click', $.proxy(function (event) {
					event.preventDefault();

					var $ctx = $(this);
					$($ctx.attr('data-custom-toggle')).add(this).toggleClass('active');
				}, $this));

				if ($this.attr("data-custom-toggle-hide-on-blur") === "true") {
					$body.on("click", $this, function (e) {
						if (e.target !== e.data[0]
								&& $(e.data.attr('data-custom-toggle')).find($(e.target)).length
								&& e.data.find($(e.target)).length === 0) {
							$(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
						}
					})
				}

				if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
					$body.on("click", $this, function (e) {
						if (e.target !== e.data[0] && $(e.data.attr('data-custom-toggle')).find($(e.target)).length === 0 && e.data.find($(e.target)).length === 0) {
							$(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
						}
					})
				}
			}
		}
	});
}());


//traslations
const translations = {
	en:{
		home_text: "Home",
		about1: "About",
		portfolio1: "Portfolio",
		contacts1: "Contacts",
		title: "SALMAST <br> quality proven by time",
		description: "Salmast Furniture, founded in 1991, was one of the first in Armenia to offer people the opportunity to order luxurious custom-branded furniture.",
        since: "Since 1991",
		salmast_furniture: "Salmast Furniture",
		why: "Why choose us",
		besides: "Besides great interior design, there are lots of reasons to choose Salmast. Here are some of the most popular ones.",
		professional_team: "Professional Team",
		our_team: "Our team includes only the best interior designers in the industry.",
		unusual: "Unusual Ideas",
		our_designers: "Our designers generate various yet always original ideas that will surely fit your needs.",
		made: "Made with Respect",
		all_our_work: "All our work is built around respect to our clients, great service, and creativity.",
		send_request: "Send request",
		our_portfolio: "Our Portfolio",
		all_our_projects: "All our projects are unique and designed to last. Take a look at our recent works to find it out for yourself.",
		learn_more: "Watch More",
		book: "Book a free designer consultation",
		a_great_way: "A great way to your new interior",
		discuss: "Discuss every aspect of your interior with one of our designers",
		let_us: "Let us plan and calculate every part of your new interior",
		you_can: "You can also ask questions and suggest any project changes",
		name: "Name",
		email: "E-mail",
		button_send: "Send request",
		call_us: "or call us now",
		aram: "Hayk Grigoryan",
		client1: "Customer",
		review1: "The Salmast team exceeded all my expectations! They created not only a beautiful but also a functional and comfortable interior for my home. Their attention to detail and quality is flawless.",
		karen: "Karen Martirosyan",
		client2: "Customer",
		review2: "I have trusted Salmast for many years. Their professionalism, high-quality materials, and personalized approach are truly impressive. Every time, the result is even better than I expected!",
		tony: "Tony Montana",
		client3: "Customer",
		review3: "Salmast is truly a leader in its field! I ordered furniture for my office, and it turned out to be not only stylish but also durable and professionally crafted. Thank you for your dedication to excellence!",
		learn_more1: "Watch More",
		our_address: "Our Address",
		address: "22 Rubinyants St, Yerevan 0069",
		working_hours: "Working Hours",
		sun: "Sun: 12:00-19:00",
		mon: "Mon-Sat: 10:30-19:00",
		socials: "Socials",
		phone: "phone",
		email1: "Email",
		salmast1: "Salmast",
		all_rights: ". All Rights Reserved. Designed by DanJn",
		free: "Free consultation",
	},
	am:{
		home_text: "Գլխավոր",
		about1: "Մեր մասին",
		portfolio1: "Պորտֆոլիո",
		contacts1: "Կապ",
		title: "ՍԱԼՄԱՍՏ՝ ժամանակով փորձված որակ",
		description: "Սալմաստ Կահույքը, որը հիմնադրվել է 1991 թվականին, առաջիններից էր Հայաստանում, որը մարդկանց հնարավորություն տվեց պատվիրել շքեղ անհատական բրենդային կահույք։",
        since: "Սկսած 1991",
		salmast_furniture: "Սալմաստ Կահույք",
		why: "Ինչու ընտրել մեզ",
		besides: "Բացի հրաշալի ինտերիերի դիզայնից, շատ պատճառներ կան ընտրելու մեզ։ Ահա դրանցից ամենահայտնիները։",
		professional_team: "Պրոֆեսիոնալ թիմ",
		our_team: "Մեր թիմը ներառում է միայն լավագույն ինտերիերի դիզայներները։",
		unusual: "Անսովոր գաղափարներ",
		our_designers: "Մեր դիզայներները մշակում են տարբեր, բայց միշտ օրիգինալ գաղափարներ, որոնք հարմար կլինեն ձեր կարիքներին։",
		made: "Ստեղծված հարգանքով",
		all_our_work: "Մեր բոլոր աշխատանքները կառուցված են հաճախորդների հարգանքի, գերազանց սպասարկման և ստեղծագործական մոտեցման վրա։",
		send_request: "Ուղարկել հարցում",
		our_portfolio: "Մեր պորտֆոլիոն",
		all_our_projects: "Մեր բոլոր նախագծերը եզակի են և նախատեսված են երկար ծառայելու։ Դիտեք մեր վերջին աշխատանքները։",
		learn_more: "Տեսնել ավելին",
		book: "Գրանցվեք անվճար դիզայների խորհրդատվության",
		a_great_way: "Հիանալի միջոց ձեր նոր ինտերիերի համար",
		discuss: "Քննարկեք ձեր ինտերիերի բոլոր ասպեկտները մեր դիզայներներից մեկի հետ",
		let_us: "Թողեք մեզ պլանավորել և հաշվարկել ձեր նոր ինտերիերի բոլոր մասերը",
		you_can: "Դուք կարող եք նաև տալ հարցեր և առաջարկել փոփոխություններ",
		name: "Անուն",
		email: "Էլ․ փոստ",
		button_send: "Ուղարկել հարցում",
		call_us: "կամ զանգահարեք մեզ հիմա",
		aram: "Հայկ Գրիգորյան",
		client1: "հաճախորդ",
		review1: " Սալմաստ Կահույքի թիմը գերազանցեց իմ սպասելիքները: Նրանք ստեղծեցին ոչ միայն գեղեցիկ, այլև ֆունկցիոնալ և հարմարավետ միջավայր իմ տան համար: Նրանց աշխատանքը կատարյալ է մանրամասների նկատմամբ ուշադրության և որակի առումով։",
		karen: "Կարեն Մարտիրոսյան",
		client2: "հաճախորդ",
		review2: "Ես արդեն երկար տարիներ վստահում եմ Սալմաստին: Նրանց արհեստավարժությունը, նյութերի բարձր որակը և անհատական մոտեցումը պարզապես ապշեցնում են։ Ամեն անգամ արդյունքն ավելի լավն է, քան սպասում էի։",
		tony: "Տոնի Մոնտանա",
		client3: "հաճախորդ",
		review3: "Սալմաստն իրոք իր ոլորտի առաջատարն է: Ես պատվիրել եմ կահույք իմ գրասենյակի համար, և այն ոչ միայն գեղեցիկ է, այլև դիմացկուն և պրոֆեսիոնալ ոճով: Շնորհակալ եմ ձեր նվիրված աշխատանքի համար!",
		learn_more1: "Տեսնել ավելին",
		our_address: "Մեր հասցեն",
		address: "Ռուբինյանց 22, Երևան 0069",
		working_hours: "Աշխատանքային ժամեր",
		sun: "Կիրակի: 12:00-19:00",
		mon: "Երկ-Շբթ: 10:30-19:00",
		socials: "Սոց․ ցանցեր",
		phone: "Հեռախոսահամար",
		email1: "Էլ. փոստ",
		salmast1: "Salmast",
		all_rights: ". Բոլոր իրավունքները պաշտպանված են։ Նախագծված է DanJn-ի կողմից",
		free: "Անվճար խորհրդատվություն",

	},
	ru:{
		home_text: "Главная",
		about1: "О нас",
		portfolio1: "Портфолио",
		contacts1: "Контакты",
		title: "САЛМАСТ качество, проверенное временем",
		description: "Салмаст, основанный в 1991 году, был одним из первых в Армении, кто предоставил людям возможность заказывать роскошную индивидуальную брендированную мебель.",
        since: "С 1991",
		salmast_furniture: "Салмаст",
		why: "Почему выбрать нас",
		besides: "Помимо отличного дизайна интерьера, есть множество причин выбрать нас. Вот некоторые из самых популярных.",
		professional_team: "Профессиональная команда",
		our_team: "В нашей команде только лучшие дизайнеры интерьера.",
		unusual: "Необычные идеи",
		our_designers: "Наши дизайнеры создают различные, но всегда оригинальные идеи, которые точно подойдут под ваши нужды.",
		made: "Создано с уважением",
		all_our_work: "Вся наша работа основана на уважении к клиентам, отличном сервисе и креативности.",
		send_request: "Отправить запрос",
		our_portfolio: "Наше портфолио",
		all_our_projects: "Все наши проекты уникальны и рассчитаны на долговечность. Посмотрите наши последние работы.",
		learn_more: "Увидеть больше",
		book: "Запишитесь на бесплатную консультацию дизайнера",
		a_great_way: "Отличный способ создать новый интерьер",
		discuss: "Обсудите все аспекты вашего интерьера с нашим дизайнером",
		let_us: "Позвольте нам спланировать и рассчитать каждую деталь вашего нового интерьера",
		you_can: "Вы также можете задать вопросы и предложить изменения в проекте",
		name: "Имя",
		email: "Эл. почта",
		button_send: "Отправить запрос",
		call_us: "или позвоните нам сейчас",
		aram: "Айк Григорян",
		client1: "Клиент",
		review1: "Команда Салмаст превзошла все мои ожидания! Они создали не только красивый, но и функциональный и удобный интерьер для моего дома. Их внимание к деталям и качеству безупречно.",
		karen: "Карен Мартиросян",
		client2: "Клиент",
		review2: "Я уже много лет доверяю Салмаст. Их профессионализм, высокое качество материалов и индивидуальный подход просто поражают. Каждый раз результат оказывается лучше, чем я ожидал!",
		tony: "Тони Монтана",
		client3: "Клиент",
		review3: "Салмаст действительно лидер в своей сфере! Я заказывал мебель для офиса, и она оказалась не только стильной, но и очень прочной и профессионально выполненной. Спасибо за вашу преданность работе!",
		learn_more1: "Увидеть больше",
		our_address: "Наш адрес",
		address: "ул. Рубинянца 22, Ереван 0069",
		working_hours: "Часы работы",
		sun: "Вс: 12:00-19:00",
		mon: "Пн-Сб: 10:30-19:00",
		socials: "Социальные сети",
		phone: "Телефон",
		email1: "Эл. почта",
		salmast1: "Salmast",
		all_rights: ". Все права защищены. Разработано DanJn",
		free: "Бесплатная консультация",

	}
}

const languageSelector = document.querySelector("languageSelector1");
let home_text = document.getElementById("home_text");
let about1 = document.getElementById("about1");
let portfolio1 = document.getElementById("portfolio1");
let contacts1 = document.getElementById("contacts1");
let title = document.getElementById("title");
let description = document.getElementById("description");
let since = document.getElementById("since");
let salmast_furniture = document.getElementById("salmast_furniture");
let why = document.getElementById("why");
let besides = document.getElementById("besides");
let professional_team = document.getElementById("professional_team");
let our_team = document.getElementById("our_team");
let unusual = document.getElementById("unusual");
let our_designers = document.getElementById("our_designers");
let made = document.getElementById("made");
let all_our_work = document.getElementById("all_our_work");
let send_request = document.getElementById("send_request");
let our_portfolio = document.getElementById("our_portfolio");
let all_our_projects = document.getElementById("all_our_projects");
let learn_more = document.getElementById("learn_more");
let book = document.getElementById("book");
let a_great_way = document.getElementById("a_great_way");
let discuss = document.getElementById("discuss");
let let_us = document.getElementById("let_us");
let you_can = document.getElementById("you_can");
let name = document.getElementById("name");
let email = document.getElementById("email");
let button_send = document.getElementById("button_send");
let call_us = document.getElementById("call_us");
let aram = document.getElementById("aram");
let client1 = document.getElementById("client1");
let review1 = document.getElementById("review1");
let karen = document.getElementById("karen");
let client2 = document.getElementById("client2");
let review2 = document.getElementById("review2");
let tony = document.getElementById("tony");
let client3 = document.getElementById("client3");
let review3 = document.getElementById("review3");
let learn_more1 = document.getElementById("learn_more1");
let our_address = document.getElementById("our_address");
let address = document.getElementById("address");
let working_hours = document.getElementById("working_hours");
let sun = document.getElementById("sun");
let mon = document.getElementById("mon");
let socials = document.getElementById("socials");
let phone = document.getElementById("phone");
let email1 = document.getElementById("email1");
let salmast1 = document.getElementById("salmast1");
let all_rights = document.getElementById("all_rights");
let free = document.getElementById("free");



const setLanguage = (language) => {
	if(language == "en"){
		home_text.innerText = translations.en.home_text;
        about1.innerText = translations.en.about1;
        portfolio1.innerText = translations.en.portfolio1;
        contacts1.innerText = translations.en.contacts1;
        title.innerHTML = translations.en.title;
        description.innerText = translations.en.description;
        since.innerText = translations.en.since;
        salmast_furniture.innerText = translations.en.salmast_furniture;
        why.innerText = translations.en.why;
        besides.innerText = translations.en.besides;
        professional_team.innerText = translations.en.professional_team;
        our_team.innerText = translations.en.our_team;
        unusual.innerText = translations.en.unusual;
        our_designers.innerText = translations.en.our_designers;
        made.innerText = translations.en.made;
        all_our_work.innerText = translations.en.all_our_work;
        send_request.innerText = translations.en.send_request;
        our_portfolio.innerText = translations.en.our_portfolio;
        all_our_projects.innerText = translations.en.all_our_projects;
        learn_more.innerText = translations.en.learn_more;
        book.innerText = translations.en.book;
        a_great_way.innerText = translations.en.a_great_way;
        discuss.innerText = translations.en.discuss;
        let_us.innerText = translations.en.let_us;
        you_can.innerText = translations.en.you_can;
        name.innerText = translations.en.name;
        email.innerText = translations.en.email;
        button_send.innerText = translations.en.button_send;
        call_us.innerText = translations.en.call_us;
        aram.innerText = translations.en.aram;
        client1.innerText = translations.en.client1;
        review1.innerText = translations.en.review1;
        karen.innerText = translations.en.karen;
        client2.innerText = translations.en.client2;
        review2.innerText = translations.en.review2;
        tony.innerText = translations.en.tony;
        client3.innerText = translations.en.client3;
        review3.innerText = translations.en.review3;
        learn_more1.innerText = translations.en.learn_more1;
        our_address.innerText = translations.en.our_address;
        address.innerText = translations.en.address;
        working_hours.innerText = translations.en.working_hours;
        sun.innerText = translations.en.sun;
        mon.innerText = translations.en.mon;
        socials.innerText = translations.en.socials;
        phone.innerText = translations.en.phone;
        email1.innerText = translations.en.email1;
        salmast1.innerText = translations.en.salmast1;
        all_rights.innerText = translations.en.all_rights;
		free.innerText = translations.en.free;
		console.log("en");
 	}
	else if (language == "am"){
		home_text.innerText = translations.am.home_text;
        about1.innerText = translations.am.about1;
        portfolio1.innerText = translations.am.portfolio1;
        contacts1.innerText = translations.am.contacts1;
title.innerText = translations.am.title;
description.innerText = translations.am.description;
since.innerText = translations.am.since;
salmast_furniture.innerText = translations.am.salmast_furniture;
why.innerText = translations.am.why;
besides.innerText = translations.am.besides;
professional_team.innerText = translations.am.professional_team;
our_team.innerText = translations.am.our_team;
unusual.innerText = translations.am.unusual;
our_designers.innerText = translations.am.our_designers;
made.innerText = translations.am.made;
all_our_work.innerText = translations.am.all_our_work;
send_request.innerText = translations.am.send_request;
our_portfolio.innerText = translations.am.our_portfolio;
all_our_projects.innerText = translations.am.all_our_projects;
learn_more.innerText = translations.am.learn_more;
book.innerText = translations.am.book;
a_great_way.innerText = translations.am.a_great_way;
discuss.innerText = translations.am.discuss;
let_us.innerText = translations.am.let_us;
you_can.innerText = translations.am.you_can;
name.innerText = translations.am.name;
email.innerText = translations.am.email;
button_send.innerText = translations.am.button_send;
call_us.innerText = translations.am.call_us;
aram.innerText = translations.am.aram;
client1.innerText = translations.am.client1;
review1.innerText = translations.am.review1;
karen.innerText = translations.am.karen;
client2.innerText = translations.am.client2;
review2.innerText = translations.am.review2;
tony.innerText = translations.am.tony;
client3.innerText = translations.am.client3;
review3.innerText = translations.am.review3;
learn_more1.innerText = translations.am.learn_more1;
our_address.innerText = translations.am.our_address;
address.innerText = translations.am.address;
working_hours.innerText = translations.am.working_hours;
sun.innerText = translations.am.sun;
mon.innerText = translations.am.mon;
socials.innerText = translations.am.socials;
phone.innerText = translations.am.phone;
email1.innerText = translations.am.email1;
salmast1.innerText = translations.am.salmast1;
all_rights.innerText = translations.am.all_rights;
free.innerText = translations.am.free;

		console.log("am");
	}
	else if (language == "ru"){
		home_text.innerText = translations.ru.home_text;
		about1.innerText = translations.ru.about1;
		portfolio1.innerText = translations.ru.portfolio1;
		contacts1.innerText = translations.ru.contacts1;
		title.innerText = translations.ru.title;
		description.innerText = translations.ru.description;
		since.innerText = translations.ru.since;
		salmast_furniture.innerText = translations.ru.salmast_furniture;
		why.innerText = translations.ru.why;
		besides.innerText = translations.ru.besides;
		professional_team.innerText = translations.ru.professional_team;
		our_team.innerText = translations.ru.our_team;
		unusual.innerText = translations.ru.unusual;
		our_designers.innerText = translations.ru.our_designers;
		made.innerText = translations.ru.made;
		all_our_work.innerText = translations.ru.all_our_work;
		send_request.innerText = translations.ru.send_request;
		our_portfolio.innerText = translations.ru.our_portfolio;
		all_our_projects.innerText = translations.ru.all_our_projects;
		learn_more.innerText = translations.ru.learn_more;
		book.innerText = translations.ru.book;
		a_great_way.innerText = translations.ru.a_great_way;
		discuss.innerText = translations.ru.discuss;
		let_us.innerText = translations.ru.let_us;
		you_can.innerText = translations.ru.you_can;
		name.innerText = translations.ru.name;
		email.innerText = translations.ru.email;
		button_send.innerText = translations.ru.button_send;
		call_us.innerText = translations.ru.call_us;
		aram.innerText = translations.ru.aram;
		client1.innerText = translations.ru.client1;
		review1.innerText = translations.ru.review1;
		karen.innerText = translations.ru.karen;
		client2.innerText = translations.ru.client2;
		review2.innerText = translations.ru.review2;
		tony.innerText = translations.ru.tony;
		client3.innerText = translations.ru.client3;
		review3.innerText = translations.ru.review3;
		learn_more1.innerText = translations.ru.learn_more1;
		our_address.innerText = translations.ru.our_address;
		address.innerText = translations.ru.address;
		working_hours.innerText = translations.ru.working_hours;
		sun.innerText = translations.ru.sun;
		mon.innerText = translations.ru.mon;
		socials.innerText = translations.ru.socials;
		phone.innerText = translations.ru.phone;
		email1.innerText = translations.ru.email1;
		salmast1.innerText = translations.ru.salmast1;
		all_rights.innerText = translations.ru.all_rights;
		free.innerText = translations.ru.free;

		console.log("ru");
}
}

// languageSelector.addEventListener("change", (event) =>{
// 	setLanguage(event.target.value);
// })

document.addEventListener("DOMContentLoaded", function() {
	let languageSelector = document.getElementById("languageSelector1");
  
	if (languageSelector) {
	  languageSelector.addEventListener("change", (event) => {
		setLanguage(event.target.value);
	  });
	} else {
	  console.error("Element with ID 'languageSelector1' not found.");
	}
});


//Firebase database
// Import Firebase configuration and functions
import { database, ref, set } from './firebaseConfig.js';

document.addEventListener("DOMContentLoaded", function() {
  let languageSelector = document.getElementById("languageSelector1");
  let nameInput = document.getElementById("name");
  let emailInput = document.getElementById("email");
  let submitButton = document.getElementById("button_send");

  if (languageSelector) {
    languageSelector.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });
  } else {
    console.error("Element with ID 'languageSelector1' not found.");
  }

  if (submitButton) {
    submitButton.addEventListener("click", function() {
      let name = nameInput.value;
      let email = emailInput.value;

      if (name && email) {
        // Store data in Firebase Realtime Database
        set(ref(database, 'users/' + name), {
          username: name,
          email: email
        }).then(() => {
          console.log("Data saved successfully!");
        }).catch((error) => {
          console.error("Error saving data: ", error);
        });
      } else {
        console.error("Name and email are required.");
      }
    });
  } else {
    console.error("Element with ID 'button_send' not found.");
  }
});