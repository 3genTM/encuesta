$(document).ready(function(e){
    
    $.ajax({
    method:"GET",
    url: "http://mariabelenalegre.com/api-encuenta/api.php"})
    
    .done(function(objetos){
        
        objetos =  JSON.parse(objetos); // si o si tiene que suceder para que tome los datos
        console.log(objetos);

        console.log("valor q le pedi", objetos[0].enunciado);
        console.log("las respuestas son: ", objetos[0].respuestas);

       

        for(var i=0; i<objetos.length;i++){  

          
            let preg = '<div><p>' + objetos[i].enunciado +'</p>'; 
            
            
            for (var j = 0 ; j < objetos[i].respuestas.length ; j++){
                let resp = '<input type="radio" name="opcion'+ i +'" >' + objetos[i].respuestas[j]+ '</br>';
                preg+=resp;        
                
            }
            preg +='</div>';

            //console.log(rta);
        
        

        $('#resultado').append(preg);   
            
            
           
        }
        

	}); 

});
