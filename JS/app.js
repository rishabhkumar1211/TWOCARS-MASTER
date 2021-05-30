//commonly used properties are defined for shortcut
var width = window.innerWidth;
var height = window.innerHeight;
var canvas = document.getElementById("canvas");
var c = canvas.getContext('2d');
canvas.width = width;
canvas.height = height;
canvas.style.backgroundColor = "#25337a";
c.fillStyle = "grey"; //line color
var score = 0;
var f=1; // to count sscore
var draw_again_status=1;  
var speed_counter = 25; //to set the speed of car
//array to store generated obstacles
var red_circle_rectangles= [];  //for red one 
var blue_circles_rectangles= [];// for blue one

/*audio part*/
const bgsound=new Audio();
bgsound.src="audio/bgmusic.mp3";

const circlesound=new Audio();
circlesound.src="audio/circles.mpeg";

const collision_sound=new Audio();
collision_sound.src="audio/collision.mpeg";



//select sound element
const soundElement=document.getElementById("sound");
soundElement.addEventListener("click",audioManager);
function audioManager()
{
    //change image sound on off
    let imgSrc=soundElement.getAttribute("src");
    let sound_img=imgSrc=="audio/icons8-audio-100.png"?"audio/icons8-no-audio-80.png":"audio/icons8-audio-100.png";
     soundElement.setAttribute("src",sound_img);

    //mute and unmute
    bgsound.muted=bgsound.muted?false:true;
}
function clearCanvas()
{
    //it is used to clear the pixels 
    c.clearRect(0, 0, width, height); 
}

function restartbutton(){ 
    window.location.reload();
}
// Create new img element
var redcar = new Image(); 
var bluecar= new Image();  
// Set source path
redcar.src="Images/Red.png"; 
bluecar.src="Images/Blue.png";

function component_of_car(colour) 
{
    if(colour == "blue") 
    {
        //initial side on lane
        this.current = "right",
        //copy image to this pointer
        this.car = bluecar,this.x = width/2 - 180,this.y = height - 150;
    }
    else
    {
        //initial side on lane
        this.current= "left",
        //copy image to this pointer
        this.car = redcar,this.x = width/2 + 120,this.y = height - 150;
    }
    
    this.newPos = function ()
    {
        //drawing car at new position passing image and x ,y co-ordinate
        c.drawImage(this.car, this.x, this.y);
    };

    //after drawing a car updating its position for next click 
    //if it was on left lane left part then it will move to right and vice -versa
    //if it was on right lane left part then it will move to left and vice-versa

    this.next_pos = function () 
    {
        if(this.current == "left") 
        {
            //updating next pos to right
            this.current= "right",this.x -= 100; 
        } 
        else 
        {
            //updating next pos to left
            this.current= "left",this.x += 100; 
        }
    };
}

//create new cars instance,not drawing again
var redone = new component_of_car("red");
var blueone = new component_of_car("blue");

// adding keyboard controllers
document.addEventListener('keydown',move_car,false);
//function for keyborad call 

function move_car(e)
{
    switch(e.keyCode)
    {
        case 37:
            //left key pressed
            blueone.next_pos();
            break;

        case 39:
            //right key is presed
            redone.next_pos();  
            break;

    }
}


function restart(){
    document.getElementById("restartMenu").style.display = "block";
    document.getElementById("endscore").innerHTML = score;
}



function collision(){
    restart();

}


function drawTrack()
{   
    //to draw a line passed x,y,width,height
    //white line 
    c.fillStyle = "#fff";
    //middle one
    c.fillRect(width/2,0,2,height);
    //middle -1
    c.fillRect(width/2 - 100,0,2,height);
    //mddle -2
    c.fillRect(width/2-200,0,2,height);
    //midlle +1
    c.fillRect(width/2+100,0,2,height);
    //middle+2
    c.fillRect(width/2+200,0,2,height);

};

function random_value()
{
    //returns 0 or 1,2
    return Math.floor((Math.random()*2));
}
/* calling draw circles function */
function draw_circles(X,Y,Z) //passing x,y co-ordinate and color
{
    //outer most part
    c.beginPath();//used to draw sth from beginning no contact from last drawing otherwise all drawing will join each other
    c.arc(X, Y, 25, 0, 2*Math.PI); //x and y are co-ordinate
    c.stroke(); 
    c.fillStyle = Z; //colour
    c.fill();

    //middle part white color
    c.beginPath();
    c.arc(X, Y, 25*0.8, 0, 2*Math.PI);
    c.stroke(); 
    c.fillStyle ="#ffffff";
    c.fill();

    //inner most part 
    c.beginPath();
    c.arc(X, Y, 25*0.5, 0, 2*Math.PI);
    c.stroke(); 
    c.fillStyle = Z;
    c.fill();
}
/* calling draw rectangle function */
function draw_rect(X,Y,Z)
{
        //outer portion in solid color
        c.beginPath();
        c.fillStyle = Z;
        c.fillRect(X-8, Y, 40, 40);

        //just inner part part with white color
        c.beginPath();
        c.fillStyle = '#ffffff';
        c.fillRect(X-6, Y+2, 35, 35);

        //middle part
        c.beginPath();
        c.fillStyle = Z;
        c.fillRect(X-1, Y+7, 25, 25);
}

/*function for printing objects we stored in array after generating*/
function generated_object(color)
{
    //coordinates
    this.posX=0;
    this.posY=-100;

    //colour of obstacle
    if(color=="red") this.color="#FE3E67";
    else this.color="#05A8C4";

    //decide shape randomly

    if(random_value()) this.shape="circle";
    else this.shape="rect";

    //decide position randomly

    if(random_value()) this.update_pos="left";
    else this.update_pos="right";

    //decide width of object

    if(this.shape == "circle")  this.posX = width/2 - 150;
    else this.posX = width/2 - 162.5;
    
    //update co-ordinate for object for respective lane

    if(this.update_pos == "left") this.posX += 100;
    if(color == "red") this.posX += 200;

    //draw circles and rectangles acc to random guessed as above

    // it will remain 1 until it collides with car and after collision it becomes zero and draw function doesn't execute
    var status=1;
    //rectnagle disappear after travelling whole screen height
    var status_r=1; 
    if(draw_again_status){
    this.draw = function () 
    {
        if(this.shape == "rect")
        {
            if(status_r==1) //if not travelled whole screen
            {
                draw_rect(this.posX,this.posY,this.color);
            }
        } 
        else if(status==1) //before collision 
        {
            draw_circles(this.posX,this.posY,this.color);
        }
            
    
    };
}

    this.update = function () 
    {
        this.posY += 10;

        console.log(  Math.floor( Math.sqrt( Math.pow(this.posX - redone.x , 2) + Math.pow(this.posY - redone.y,2) ) ) || Math.sqrt(   Math.floor( Math.sqrt( Math.pow(this.posX - blueone.x,2) + Math.pow(this.posY - blueone.y,2)) )  < 40 )    )  //to get the value of collision logic

        if(this.shape=="rect" && (Math.sqrt(   Math.floor( Math.sqrt( Math.pow(this.posX - redone.x,2) + Math.pow(this.posY - redone.y,2)) )  < 40 )  || Math.sqrt(   Math.floor( Math.sqrt( Math.pow(this.posX - blueone.x,2) + Math.pow(this.posY - blueone.y,2)) )  < 40 )))
        {
            bgsound.muted=true;
            draw_again_status=0;
            if(f==1) collision_sound.play();
              f=0;
            collision();     //call for collision func
        }
        else if(this.posY ==height) 
        {
            //for disappearing rect obj 
            status_r=0;
        }
        if(this.shape=="circle" && (Math.sqrt(   Math.floor( Math.sqrt( Math.pow(this.posX - redone.x,2) + Math.pow(this.posY - redone.y,2)) )  < 40 )  || Math.sqrt(   Math.floor( Math.sqrt( Math.pow(this.posX - blueone.x,2) + Math.pow(this.posY - blueone.y,2)) )  <40 )))
        {
            circlesound.pause();
            if(status==1)
            {score++; }
            status=0; //disappearing circle after collision
            //score updated after each collision 
            if(score % 20 == 0 && speed_counter > 20){
                console.log("speed Increased");
                speed_counter--;
            }
            circlesound.play();
            document.getElementById("score").innerHTML = score; }//calling func to print score
        /*this is a special condition*/
        /* if circle and car collison doesnt occur game is over */
        else if(this.shape=="circle" && this.posY >=750 && status==1)
        {
            status=0;
            f=0;
            bgsound.muted=true;
            draw_again_status=0;
            if(f==1) collision_sound.play();
            collision(); 
            
        }
        
        
        
    }
}

function all_function_call()
{
    clearCanvas();
    drawTrack();
    redone.newPos();
    blueone.newPos();
    
    red_circle_rectangles.forEach(function (generated_object) {
        generated_object.update();
        generated_object.draw();
    })
    blue_circles_rectangles.forEach(function (generated_object) {
        generated_object.update();
        generated_object.draw();
    })

    
}


// to hide the start screen while playing
function playbutton(){
      document.querySelector('#startMenu').style.display = "none";
        bg_call();
    }

function bg_call() {

    //generating obstacles and storing in an array
   var id =  setInterval
    (function () {
        red_circle_rectangles.push(new generated_object("red"));
        blue_circles_rectangles.push(new generated_object("blue"));
    }, 1000);

   speed_of_obj();
};

function speed_of_obj(){
    bgsound.play();
    var id1 = setInterval(all_function_call,speed_counter);
}