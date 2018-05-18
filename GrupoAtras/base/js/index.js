var jsonRtas= [];


$(document).on('ready',function(e){
});
	// Cargar populares
	$.ajax({
		method: 'GET',
		url: 'http://mariabelenalegre.com/api-encuenta/api.php',		

	})
	
	.done(function(response){
		console.log(response);

		let parse = JSON.parse(response);
		
        $.each(parse,function(index,elem){
			
			let encuesta = $('#encuesta');
			let ul = `<div><ul id="${index}"><h2>${elem.enunciado}</h2>
			</ul><input type="button" class="boton" data-id="${index}" value="Votar"><div>`;		
			encuesta.append(ul);

			$.each(elem.respuestas,function(i,e){
			
				let li = `<li><input type="radio" name="rta" value="${e}">${e}</input></li>`;
				$('#'+index).append(li);
				console.log(li);            
			})            
		});

		function traerVoto(){
			var valorVoto = $("input[name=rta]:checked").val();
			
			console.log('respuesta elegida: '+valorVoto);
		}

		$('.boton').on('click',function(){
			traerVoto();
			let idUl = $(this).parent().first().first().text();
			console.log(idUl);
		
		});

	})
	
	// Cargar encuestas



function cargarEncuestas(){



	// Se recorre el json de preguntas y se cargan las preguntas con sus respuestas
	// Las respuestas tienen un check 
	// Poner un botón votar
	// Puede haber mas de una respuesta para una pregunta

}