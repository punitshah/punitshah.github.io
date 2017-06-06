
var recipe1 = {_id: "001", name: "Caramelized Onions", steps: [{text: "Ready to make caramelized onions?!", trigger: "gesture", image:"caramelized-onions.jpg"}, 
   {text: "Add oil", trigger: "gesture", image:"add-oil.jpg"}, 
   {text: "Wait for pan to heat", trigger: "temperature", temp: "280"}, 
   {text: "Add onions", trigger: "gesture", image:"add-onions.jpg"}, 
   {text: "Caramelizing. Stir every minute", trigger: "time", time: "8", image:"stir.jpg"}, 
   {text: "Remove and serve!", trigger: "gesture", image:"plate.jpg"}]};

var recipe2 = {_id: "002", name: "Chicken & Basil", steps: [{text: "Ready to make Chicken & Basil?!", trigger: "gesture"}, 
   {text: "Add oil", trigger: "gesture"}, 
   {text: "Wait for pan to heat", trigger: "temperature", temp: "300"}, 
   {text: "Add garlic and onions", trigger: "gesture", }, 
   {text: "Cooking. Stir every minute", trigger: "time", time: "6"},
   {text: "Add chicken and soy sauce", trigger: "gesture", }, 
   {text: "Cooking chicken. Stir frequently", trigger: "time", time: "7"},  
   {text: "Remove to a plate and top with basil!", trigger: "gesture"}]};

var recipes = [recipe1, recipe2];

var currRecipe = new Recipe(0, 001, 0);

var currTemp;

function Recipe(myRecipe, id, stepCounter){
	this.myRecipe = recipes[myRecipe];
	this.id = id;
	this.stepCounter = 0;
	console.log("Created new Recipe");
}

Recipe.prototype.render = function(){
  currRecipe = this;
	console.log(this.myRecipe);
	var newRecipe = document.getElementById("newRecipe");
	console.log("newRecipe: ", newRecipe);

  var elements = document.getElementsByClassName("step");   //clear past step
  console.log("divs: ", elements);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
  var step = document.createElement('div');
  step.innerHTML = this.myRecipe.steps[this.stepCounter].text;
  step.className = "step";
  console.log("long: ", this.myRecipe.steps[this.stepCounter].text);
  newRecipe.appendChild(step);
  renderPhoto();

};

function renderPhoto(){
  console.log("adding photo", currRecipe.myRecipe.steps[currRecipe.stepCounter].image);

  if(currRecipe.myRecipe.steps[currRecipe.stepCounter].image){
    var newRecipe = document.getElementById("newRecipe");
    var image = document.createElement('img');
    image.src = currRecipe.myRecipe.steps[currRecipe.stepCounter].image;
    newRecipe.appendChild(image);
  }
}

function nextStep(){
	if(currRecipe.stepCounter < currRecipe.myRecipe.steps.length - 1){
        currRecipe.stepCounter++;
    }
   	var step = document.getElementById("step");
    var elements = document.getElementsByClassName("step");
    elements[0].innerHTML = currRecipe.myRecipe.steps[currRecipe.stepCounter].text;
    renderPhoto();
    updateTempAndTimer();
};

function prevStep(){
  if(currRecipe.stepCounter > 1){
    currRecipe.stepCounter--;
  }
  //var step = document.getElementById("step");
  var elements = document.getElementsByClassName("step");
  elements[0].innerHTML = currRecipe.myRecipe.steps[currRecipe.stepCounter].text;
  renderPhoto();
  updateTempAndTimer();

};

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function fillSidebar(){
  recipes.forEach(function callback(element, counter, array){
      var sidebar = document.getElementById("mySidenav");
      var recipeLink = document.createElement("button");
      recipeLink.class = "sidebar";
      recipeLink.innerHTML = element.name;
      recipeLink.addEventListener("click", function changeRecipe(){
        console.log("clicked");
        newRecipe = new Recipe(counter, 001, 0); //recipenum, recipe id, step counter var
        console.log("index: ", counter);
        newRecipe.render();
        console.log("CHANGING RECIPE");
      }, false); 
      //where func is your function name
      //recipeLink.onclick = changeRecipe(counter);
      sidebar.appendChild(recipeLink);
  });
      console.log("recipe list: ", recipes)
}

function updateTempAndTimer(){
  var newRecipe = document.getElementById("newRecipe");

  var time = document.getElementsByClassName("timer")[0];   //clear past step
  if(time){
    time.parentNode.removeChild(time);
  }

  var temp = document.getElementsByClassName("temp")[0];   //clear past step
  if(temp){
    temp.parentNode.removeChild(temp);
  }

    var timer = document.createElement('div');
    timer.className = "timer";
    newRecipe.appendChild(timer);
  if(currRecipe.myRecipe.steps[currRecipe.stepCounter].trigger === "time"){
    var currTimer = currRecipe.myRecipe.steps[currRecipe.stepCounter].time; 
    timer.innerHTML = currTimer + " min left";
     window.setTimeout(function(){ 
      nextStep();
      }, currTimer*60);   //*1000 increment to next step after timer
  }
  else{
    timer.innerHTML = "No Timer Needed";
  }

  var temp = document.createElement('div');
  temp.className = "temp";
  if(currRecipe.myRecipe.steps[currRecipe.stepCounter].trigger === "temperature"){
    temp.innerHTML = currTemp + " F / " + currRecipe.myRecipe.steps[currRecipe.stepCounter].temp + " F";
  }
  else{
    temp.innerHTML = currTemp + " F";
  }
  newRecipe.appendChild(temp);

}

var connection = new WebSocket('ws://websocketstest.local:81/', ['arduino']);
connection.onopen = function () {  connection.send('Connect ' + new Date()); }; 
connection.onerror = function (error) {    console.log('WebSocket Error ', error);};
connection.onmessage = function (e) {  
  console.log('Server: ', e.data);

  if(e.data[2] === "T"){  //TEMP
      console.log("Reading in Temp");
      var temp = e.data;
      temp = temp.slice(15,-1); //remove beginning
      console.log('Server (parsed): ', temp);
      currTemp = parseInt(temp) * 9/5 + 32;
      updateTempAndTimer();
  }
  if(e.data[2] === "G"){  //Gesture
      console.log("Reading in Gesture");
      var gesture = e.data;
      gesture = gesture.slice(13,-2); //remove beginning
      console.log('Server (parsed): ', gesture);
      //if(currRecipe.myRecipe.steps[currRecipe.stepCounter].trigger === "gesture"){
        if(gesture === "RIGHT"){
          prevStep();
        }
        else if (gesture === "LEFT"){
          nextStep();
        }
      //}
  }
};

connection.onclose = function(e) {
    console.log('Server: ', e.data);
    $('#SystemStatusClicker').css("color", "red" );
    IssueSystemMessage( "WebSocket Disconnected!" );
 };

function LaserToggle(){
    var OnOff = document.getElementById('flipperData').value;  
    if(OnOff === "on"){
        OnOff = "*1";
    }
    else if(OnOff === "off"){
        OnOff = "*0";
    }
    console.log('OnOff: ' + OnOff); 
    connection.send(OnOff);
}

updateTempAndTimer();

fillSidebar();

