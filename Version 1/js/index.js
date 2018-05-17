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
        let option = `<label><input class="radio" type="radio" name="options${i}">${data[i].respuestas[j]}</label>`
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

$(document).on('click', 'button',function(event){
 event.preventDefault();

 let options = $(this).siblings('.optionContainer');
 let answerText = options.find('label input:checked').parent().text();
 let questionId = parseInt(options.parent().attr('id'));
 let questionText = data[questionId].enunciado;

 // If something is  checked, call addVote()
 if (options.find('label input:checked').length) {
   addVote(questionText, answerText);
   const mostVoted = data[questionId].respuestas
    .map(answer => ({answer: answer, votes: getVote(questionText, answer)})) // Syntactic Sugar
    .sort((a, b) => b.votes - a.votes);

   const numVotes = mostVoted[0].votes;
   const winners = mostVoted.filter(item => item.votes == numVotes);

   showRanking(questionId, winners);
   console.log(answerCounter, "most voted: ", winners);
 }
 options.find('label input:checked').prop('checked', false);
})

function showRanking(question, winners) {
  let message = `<p class="title"> MÁS VOTADAS:</p>`;
  $('#results' + question).html(message);
  $.each(winners, function(index, item) {
    let winner = `<p>* ${item.answer}. Votos: ${item.votes}</p>`;
    $('#results' + question).append(winner);
  })
}
