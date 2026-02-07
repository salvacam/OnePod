$(function () {
    function limpiaUrl(cadena) {
    	cadena = cadena.replace("<![CDATA[", "");
    	cadena = cadena.replace(">", "");
    	cadena = cadena.replace("]]", "");
    	return cadena;
    }
    
    function limpiaNombre(cadena) {
        var pos = cadena.lastIndexOf(nombrePodcast + " - ");
        
        if(pos >= 0) {
        	return cadena.substring(pos + (nombrePodcast + " - ").length);
        }

    	pos = cadena.lastIndexOf(nombrePodcast + "- ");
    	if(pos >= 0) {
    		return cadena.substring(pos + (nombrePodcast + "- ").length);
    	} else {
        	return cadena.replace(nombrePodcast, "");
        }

        return cadena;
    }

    function play(cadena, title, min, number, page) {
        $("#audio").attr("src", cadena);
		$("#audio")[0].currentTime = min;
		$("#audio")[0].title = title;
        $("#titulo").remove();
        $("#audioDiv").prepend("<span id='titulo'>" + title + "</span>");
        localStorage.setItem("_scorizer_mp3", cadena);
    	$("#playLast")[0].dataset.mp3 = localStorage.getItem("_scorizer_mp3");
        localStorage.setItem("_scorizer_title", title);
    	$("#lastPodcast").html(title);
    	localStorage.setItem("_scorizer_time", min);
    	localStorage.setItem("_scorizer_number", number);
    	localStorage.setItem("_scorizer_page", page);
    	$("#lastTime").html(parseInt(parseInt($("#audio")[0].currentTime)/60));
    	window.scrollTo(0, 0);
    	$("#play").trigger("click");
    }

    function buscar(url, page) {

		var hideListen = localStorage.getItem("_scorizer_hideListen");
    	var numberListen = localStorage.getItem("_scorizer_number");
    	var pageListen = localStorage.getItem("_scorizer_page");

    	var urlFeed = encodeURI(url);
    	if (page > 1) {
    		urlFeed = urlFeed + "?&page=" + page;
    	}

    	//if (page >= pageListen) {
			$.ajax({
				type: 'GET',
				url: urlFeed,
	  			dataType: "text",
				success: function(data) {
	                data = new window.DOMParser().parseFromString(data, "text/xml");

	                const items = data.querySelectorAll("item");

	                i = 0;    
	                $(".botones").removeClass("none");
	                $(".botones").addClass("visto");

	    			if (page == 1) {    			
						$("#listadoEpisodios").text("");
	    			}

					//TODO cambiar el orden
					for (i = 0; i < items.length; i++) {
					//for (i = items.length-1; i >= 0; i--) {
						
						//TODO No mostrar si se ha escuchado y esta activo el check
						console.log("hideListen: " + hideListen);
						console.log("i: "+i);
						console.log("numberListen: "+numberListen);
						console.log("page: "+page);
						console.log("pageListen: "+pageListen);
						console.log("----");
						if (nombrePodcast == "Fallo de sistema"
							|| ((hideListen != null || hideListen == "false") 
							&& i >= numberListen && page >= pageListen)) {
							console.log("se debe mostar: "+i);

		    				var inicio = items[i].querySelector("enclosure").outerHTML.toString().indexOf('url="');
		    				var fin = items[i].querySelector("enclosure").outerHTML.toString().indexOf('.mp3');
		    				if (inicio != -1 && fin == -1) {
		    					//console.log(el.querySelector("enclosure").outerHTML);
								fin = items[i].querySelector("enclosure").outerHTML.toString().indexOf('.m4a');
		    				}
							
							var duration = 0;

							items[i].childNodes.forEach(x => { 
								//console.log(x);
								
		    					if (x.innerHTML != undefined) {
		    					 	if (x.outerHTML.indexOf('duration') > 0) {
			    						duration = x.innerHTML;
		    						}
		    					}
		    					
		    				});
		    				var urlAudio = limpiaUrl(items[i].querySelector("enclosure").outerHTML.toString().substring(inicio+5, fin+4));
		    				var titleAudio = items[i].querySelector("title").innerHTML; 
		    				var titleAudioClean = limpiaNombre(items[i].querySelector("title").innerHTML); 

		    				$("#listadoEpisodios").append("<button class='btn btn-sm smooth pista' data-number='"+ i + "' data-page='"+ page +"' data-mp3='"+urlAudio+"' data-podcast='"+titleAudio+"'>" + duration + " - " + titleAudioClean + "</button><br/>"); 
	    				}
					}

					if (items.length <= 0) {
	    				if (page == 1) {
							$("#listado").append("<h5>Error al parsear el feed</h5>");
							customAlert("Error al parsear el feed");
						}
					} else {
				    	page += 1;
				    	if (nombrePodcast != "Fallo de sistema" && feed.indexOf("salvacam") === -1) {
				    		buscar(url, page);
				    	}
					}

					$("#listado").append("</details>");
					
					$("#listadoEpisodios button").on("click", function (x) {
						play(x.target.dataset.mp3, x.target.dataset.podcast, 0, x.target.dataset.number,x.target.dataset.page);
					});
				},
				error: function(xhr, type){
					//TODO intentar obtener el feed con Proxy
	    			if (page == 1) {
						$("#listado").append("<h5>Error al obtener el feed</h5>");
						customAlert("Error al obtener el feed");
	    			}
				}
			});
		//}
    }

	function myTimer() {
		if ($("#audio")[0].duration > 0) {
			localStorage.setItem("_scorizer_time", parseInt($("#audio")[0].currentTime));
    		$("#lastTime").html(parseInt(localStorage.getItem("_scorizer_time")/60));
    		$("#playLast")[0].dataset.min = localStorage.getItem("_scorizer_time");
		}
  	}

	function customAlert(message) {
	    return new Promise(function(resolve) {
	        $('#modalMessage').text(message);
	        $('#modalCancel').hide();
	        $('#modalOk').show();
	        $('#customModal').show();

	        $('#modalOk').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve();
	        });
	    });
	}

	function customConfirm(message) {
	    return new Promise(function(resolve) {
	        $('#modalMessage').text(message);
	        $('#modalCancel').show();
	        $('#modalOk').show();
	        $('#customModal').show();

	        $('#modalOk').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve(true);
	        });

	        $('#modalCancel').off('click').on('click', function() {
	            $('#customModal').hide();
	            resolve(false);
	        });
	    });
	}

	function actualizarAvisoConexion() {
	  var aviso = document.getElementById('offline-warning');
	  if (navigator.onLine) {
	    aviso.style.display = 'none';
		$("#container").removeClass("hide");
	  } else {
	    aviso.style.display = 'block';
	    $("#container").addClass("hide");
	  }
	}

  	
  	var nombrePodcast = "Fallo de sistema";
	var nombrePodcastStorage = localStorage.getItem("_scorizer_name");
	if (nombrePodcastStorage != null && nombrePodcastStorage != "") {
		nombrePodcast = nombrePodcastStorage;		
	}

    var feed = "https://api.rtve.es/api/programas/46690/audios.rss";
	var feedStorage = localStorage.getItem("_scorizer_feed");
	if (feedStorage != null && feedStorage != "") {
		feed = feedStorage;		
	}

    $("#nombreInput").val(nombrePodcast);
    $("#feedInput").val(feed);

    var page = 1;
    buscar(feed, page);
  	$("#tituloPodcast").html(nombrePodcast);

	$('#selectFeed').on('change', function () {
		if (this.value != "") {
    		$('#feedInput').val(this.value);
    		$('#nombreInput').val(this.options[this.selectedIndex].text);
    	}
	});

	$("#editFeed").on("click", function () {
    	var nombreTemp = $('#nombreInput').val();
    	var feedTemp = $('#feedInput').val();
    	if (nombreTemp == "" || feedTemp == "") {
			customAlert("Introduce nombre y rss");
        } else {
		    customConfirm("¿Estás seguro de modificar el feed?")
		        .then(function(ok) {
		            if (ok) {
	            	  	nombrePodcast = nombreTemp;
        				localStorage.setItem("_scorizer_name", nombrePodcast);

	            	  	feed = feedTemp;
        				localStorage.setItem("_scorizer_feed", feed);

	            	    $("#nombreInput").val(nombrePodcast);
    					$("#feedInput").val(feed);
    					page = 1;
    					buscar(feed, page);
  						$("#tituloPodcast").html(nombrePodcast);
  						$('#configToggle').trigger('click');
  					} 
		        });
    	}
    });

    $("#playLast")[0].dataset.mp3 = localStorage.getItem("_scorizer_mp3");
    $("#lastPodcast").html(localStorage.getItem("_scorizer_title"));
    $("#playLast")[0].dataset.podcast = localStorage.getItem("_scorizer_title");
	$("#lastTime").html(parseInt(localStorage.getItem("_scorizer_time")/60));
	$("#playLast")[0].dataset.min = localStorage.getItem("_scorizer_time");

    $('#configToggle').on('click', function() {
        $('#config').toggleClass('show');
    	$('body').toggleClass('noscroll');
    });

	$("#darkMode").on("change", function () {
		$("body").toggleClass("dark");
        localStorage.setItem("_scorizer_dark", $('#darkMode').is(':checked'));
	});	

	$("#hideListen").on("change", function () {
        localStorage.setItem("_scorizer_hideListen", $('#hideListen').is(':checked'));
	});	
	
	$("#playerAudio").on("change", function () {
		$("audio").toggleClass("hide");
		$("#newPlayerAudio").toggleClass("hide");
        localStorage.setItem("_playpod_playerAudio", $('#playerAudio').is(':checked'));
	});

	$("#playLast").on("click", function (x) {
		play(x.target.dataset.mp3, x.target.dataset.podcast, x.target.dataset.min, x.target.dataset.number, x.target.dataset.page);
	});

	$("#rewind").on("click", function () {
		$('audio')[0].currentTime = Math.max($('audio')[0].currentTime - 10, 0);
	});
	
	$("#forward").on("click", function () {
		$('audio')[0].currentTime = Math.min($('audio')[0].currentTime + 10, $('audio')[0].duration);
	});	

	$("#play").on("click", function (x) {
		if ($('audio')[0].src != '') {
			if($('audio')[0].paused) {
				$('audio')[0].play();
				$("#play").removeClass("play");
			} else {
				$('audio')[0].pause();
				$("#play").addClass("play");
			}	
		}
	});

	const audioPlayer = document.getElementById('audio');
	const progressBar = document.getElementById('progress-bar');
	const timeDisplay = document.getElementById('time-display');
	const timeDisplayCurrent = document.getElementById('time-display-current');

	audioPlayer.addEventListener('timeupdate', () => {
	    const currentTime = audioPlayer.currentTime;
	    const duration = audioPlayer.duration;

	    // Actualizar la barra de progreso (valor entre 0 y 100)
	    if (!isNaN(duration)) {
	        const progress = (currentTime / duration) * 100;
	        progressBar.value = progress;
	    	timeDisplayCurrent.textContent = `${formatTime(currentTime)}`;
	    }
	});

	// Permitir al usuario buscar en el audio haciendo clic en la barra de progreso
	progressBar.addEventListener('input', () => {
	    const duration = audioPlayer.duration;
	    if (!isNaN(duration)) {
	        const newTime = (progressBar.value / 100) * duration;
	        audioPlayer.currentTime = newTime;
	    }
	});

	// Función de utilidad para formatear el tiempo (ej. 1:30)
	function formatTime(seconds) {
	    const minutes = Math.floor(seconds / 60);
	    const secs = Math.floor(seconds % 60);
	    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
	}

	// Inicializar la visualización de la duración una vez que los metadatos se cargan
	audioPlayer.addEventListener('loadedmetadata', () => {
	    timeDisplay.textContent = `${formatTime(audioPlayer.duration)}`;
	});
	
	actualizarAvisoConexion();	

	window.addEventListener('online', actualizarAvisoConexion);
	window.addEventListener('offline', actualizarAvisoConexion);

    setInterval(myTimer, 30000);

	var darkMode = localStorage.getItem("_scorizer_dark");
	if (darkMode != null && darkMode == "true") {
		$('#darkMode').prop('checked', true);		
		$("body").toggleClass("dark");
	}
	
	var hideListen = localStorage.getItem("_scorizer_hideListen");
	if (hideListen != null && hideListen == "true") {
		$('#hideListen').prop('checked', true);
	}

	var playerAudio = localStorage.getItem("_playpod_playerAudio");
	if (playerAudio != null && playerAudio == "true") {		
		$('#playerAudio').prop('checked', true);
		$("audio").toggleClass("hide");
		$("#newPlayerAudio").toggleClass("hide");
	}

	navigator.mediaSession.setActionHandler('play', () => {
    	//console.log('Play pulsado desde notificación');
		$('audio')[0].play();
		$("#play").removeClass("play");
  	});

	navigator.mediaSession.setActionHandler('pause', () => {
		//console.log('Pause pulsado desde notificación');
		$('audio')[0].pause();
		$("#play").addClass("play");
	});
});
