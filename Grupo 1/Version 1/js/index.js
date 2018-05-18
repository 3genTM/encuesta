
// $(function(){...}) is a shortcut for
// $(document).ready(function(){...});


var data;
var savedVotes = localStorage.getItem("votes");
var answerCounter = savedVotes ? JSON.parse(savedVotes) : {};

// Function add vote
function addVote(question, answer) {
  answerCounter[question + '|' + answer] = getVote(question, answer) + 1;
  localStorage.setItem("votes", JSON.stringify(answerCounter));
};

// Get votes
function getVote(question, answer) {
  return answerCounter[question + '|' + answer] || 0; // When the first value is undefined return the second value
};


$( document ).ready(function() {

  // Function that display data on browser
  function parse(data) {
    console.log(data);
    for (i = 0; i < data.length; i++) {
      let newColBox =  `<div id="${i}" class="colBox"></div>`;
      $('form').append(newColBox);
      let newQuestion = `<label><span class="bold">PREGUNTA ${i+1}:</span> ${data[i].enunciado}</label>`
      $('#' + i).append(newQuestion);
      let optionContainer = `<div class="optionContainer" id="optionContainer${i}"></div>`
      $('#' + i).append(optionContainer);

      for (j = 0; j < data[i].respuestas.length; j++) {
        let option = `<label><input class="radio" type="radio" name="options${i}">${data[i].respuestas[j]}</label>
        <div class="progressContainer"><div class="progress"></div><div class="progress-label"></div></div>`
        $('#optionContainer' + i).append(option);
      }

      let button = `<button class="vote" id="button${i}">VOTAR</button>`
      $('#' + i).append(button);
      let mostVotedContainer = `<div class="result" id="results${i}"></div>`;
      $('#' + i).append(mostVotedContainer);
    }
  };

  // Check if data is in cache: if is, use it and call parse(). If not, get it from api. (Update every hour)
  const cacheSurvey = JSON.parse(localStorage.getItem("cacheSurveyData") || '{}');

  if (cacheSurvey.date && new Date() - new Date(cacheSurvey.date) < 60 * 60 * 1000) {
    data = cacheSurvey.value
    parse(data);
  } else {
    $.ajax({
      method: "GET",
      url: "http://www.mariabelenalegre.com/api-encuenta/api.php"
    }).done(response => {
      data = JSON.parse(response);
      localStorage.setItem("cacheSurveyData", JSON.stringify({value: data, date: new Date().getTime()}));
      parse(data);
    });
  }
});

$(document).on('click', '.vote', function(event) {
 event.preventDefault();

 let options = $(this).siblings('.optionContainer');
 let answerText = options.find('label input:checked').parent().text();
 let questionId = parseInt(options.parent().attr('id'));
 let questionText = data[questionId].enunciado;

 // If something is  checked, call addVote()
 if (options.find('label input:checked').length) {
   let progressBars = options.parent().find('.progress');
   let progressLabels = options.parent().find('.progress-label');

   addVote(questionText, answerText);
   const mostVoted = data[questionId].respuestas
    .map(answer => ({answer: answer, votes: getVote(questionText, answer)})) // Syntactic Sugar
    .sort((a, b) => b.votes - a.votes);

   const numVotes = mostVoted[0].votes;
   $.each(data[questionId].respuestas, function(index, item) {
     let value = 100 * getVote(questionText, item) / numVotes;
     $(progressBars[index]).progressbar({value: value});
     $(progressLabels[index]).text(getVote(questionText, item) + ' votos')

   })
   const winners = mostVoted.filter(item => item.votes == numVotes);

   // showRanking(questionId, winners);
   // console.log(answerCounter, "most voted: ", winners);
 }
 options.find('label input:checked').prop('checked', false);
})

// function showRanking(question, winners) {
//   let message = `<p class="title"> MÁS VOTADAS:</p>`;
//   $('#results' + question).html(message);
//   $.each(winners, function(index, item) {
//     let winner = `<p><span class="bold">Rta:</span> ${item.answer}. <span class="bold">Votos:</span> ${item.votes}</p>`;
//     $('#results' + question).append(winner);
//   })
// }

$('#addQuestion').on('click', function(event) {
  event.preventDefault();
  $('.colBox').hide();
  let box = `<div class='newQuestion'>
              <h3>PASO 1: AGREGUE LA PREGUNTA</h3>
              <input id='newQuestion' class='adding' type='text' name='enunciado' placeholder='Ingrese el enunciado de su pregunta'>
              <h3>PASO 2: AGREGUE RESPUESTAS</h3>
              <div id='answerBox'>
                <input class='adding answers' type='text' name='respuesta' placeholder='Ingrese opción de respuesta'>
                <input class='adding answers' type='text' name='respuesta' placeholder='Ingrese opción de respuesta'>
              </div>
              <button id='addAnswer'> AGREGAR OTRA</button>
              <h3>PASO 3: LISTO!</h3>
              <button id='sendNewQuestion'> CARGAR </button> <button id='back'>VOLVER</button>

            </div>`;
  $('.container').append(box);
});

$(document).on('click', '#addAnswer',function(event){
  event.preventDefault();
  let newAnswer = `<input class='adding answers' type='text' name='respuesta' placeholder='Ingrese opción de respuesta'>`;
  $('#answerBox').append(newAnswer);
});

$(document).on('click', '#sendNewQuestion',function(event){
  event.preventDefault();
  let questionText = $('#newQuestion').val();
  let answersArray = [];
  $('.answers').each(function(index, item) {
    answersArray.push($(this).val());
  })
  let newQA = {
    enunciado: questionText,
    respuestas: answersArray
  }
  console.log(newQA)

  if (questionText != "" && answersArray.length != 0 ) {
    //Send to api
    $.ajax({
        type: 'POST',
        url: "http://www.mariabelenalegre.com/api-encuenta/api.php",
        dataType: 'json',
        data: JSON.stringify(newQA),
        success: function (result) {
                 console.log(result);
        },
        error: function (result) {
            alert("No pudo resolver");
        }
     });

     $('.newQuestion').empty();
     let success = `<p class="success">Gracias! Su pregunta fue enviada</p>
                    <button id='back'>VOLVER</button>`
    $('.newQuestion').append(success);
  } else {
    console.log("No ingresó nada o le falta llenar campos!")
  }
});

$(document).on('click', '#back',function(event){
  event.preventDefault();
  $('.colBox').show();
  $('.newQuestion').hide();
});
