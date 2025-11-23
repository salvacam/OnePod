$(function () {
    function limpiaNombre(cadena) {
    	cadena = cadena.replace("<![CDATA[", "");
    	cadena = cadena.replace(">", "");
    	cadena = cadena.replace("]]", "");
    	return cadena;
    }
    
    function limpiaUrl(cadena) {

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

    function play(cadena, title, min) {
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
    	$("#lastTime").html(parseInt(parseInt($("#audio")[0].currentTime)/60));
    	window.scrollTo(0, 0);
    	$("#play").trigger("click");
    }

    function buscar(url) {
		$.ajax({
			type: 'GET',
			url: encodeURI(url),
  			dataType: "text",
			success: function(data){
				lista = [];

                data = new window.DOMParser().parseFromString(data, "text/xml");

                const items = data.querySelectorAll("item");

                i = 0;    
                $(".botones").removeClass("none");
                $(".botones").addClass("visto");

				$("#listadoEpisodios").text("");
				//$("#listado").append("<details open=''><summary>" + nombrePodcast + "</summary><div id='listadoEpisodios'></div>");

				//TODO cambiar el orden
				for (i = 0; i < items.length; i++) {
				//for (i = items.length-1; i >= 0; i--) {
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
    				lista.push({title:limpiaNombre(items[i].querySelector("title").innerHTML), r:items[i].querySelector("enclosure").outerHTML.toString().substring(inicio+5, fin+4), time:duration});    				
			    	//});
				}

				if (lista.length > 0) {

                	//console.log(lista);                
                    $(".botones").removeClass("none");
                    $(".botones").addClass("visto");

					for (var i = 0; i < lista.length; i++) {
						$("#listadoEpisodios").append("<button class='btn btn-sm smooth pista' data-pista='" + i + "'>" + lista[i].time + " - " + limpiaUrl(lista[i].title) + "</button><br/>");
					}
					$(".pista").on("click", function () {
						play(lista[$(this).data("pista")].r, lista[$(this).data("pista")].title, 0);
					});
				} else {
					$("#listado").append("<h5>Error al parsear el feed</h5>");
					customAlert("Error al parsear el feed");
				}

				$("#listado").append("</details>");
			},
			error: function(xhr, type){
				//TODO intentar obtener el feed con Proxy
				$("#listado").append("<h5>Error al obtener el feed</h5>");
				customAlert("Error al obtener el feed");
			}
		});
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

    var lista;
  	
  	var nombrePodcast = "Escalofrío";
	var nombrePodcastStorage = localStorage.getItem("_scorizer_name");
	if (nombrePodcastStorage != null && nombrePodcastStorage != "") {
		nombrePodcast = nombrePodcastStorage;		
	}

    var feed = "https://api.rtve.es/api/programas/176750/audios.rss";
	var feedStorage = localStorage.getItem("_scorizer_feed");
	if (feedStorage != null && feedStorage != "") {
		feed = feedStorage;		
	}

    $("#nombreInput").val(nombrePodcast);
    $("#feedInput").val(feed);
    buscar(feed);    
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
    					buscar(feed);
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

	$("#playLast").on("click", function (x) {
		play(x.target.dataset.mp3, x.target.dataset.podcast, x.target.dataset.min);
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

	actualizarAvisoConexion();	

	window.addEventListener('online', actualizarAvisoConexion);
	window.addEventListener('offline', actualizarAvisoConexion);

    setInterval(myTimer, 30000);

	var darkMode = localStorage.getItem("_scorizer_dark");
	if (darkMode != null && darkMode == "true") {
		$('#darkMode').prop('checked', true);		
		$("body").toggleClass("dark");
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
