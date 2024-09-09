# arkanoid

Resources used:

Render, tilemaps and boundaries with: https://github.com/ALapinskas/jsge 
Images from here: https://petraheim.itch.io/breakout-pixelart
Audio from here: https://www.kenney.nl/assets/category:Audio
Circle/line intersection: https://gist.github.com/milkbread/11000965
Platform hit behavior: https://polarnick.com/blogs/239/2018/school239_105_2018_2019/2019/02/06/arkanoid.html

@todo 05.09/17.35:
    * block corner hit remove block (done)
    * block remove animation (done)
    * paddle changes ball direction (done)
    * paddle corner hit (done)

@toDo 06.09/ 17.28
    * fix 3 level blocks behavior and sounds (done)
    * fix responsiveness (done)
    * add speed changing(slow at the beginning and then increasing) (done)
    * add level fail (done)
    * add lives 3 (done)
    * add game over (done)
    * add optional immutable (done)
    * add levels switching (done)

@toDo 07.09 / 09.08
    * fix(avoid) angles near Math.PI/-Math.PI/0 (done)

@toDo 08.09 / 10.37
    * add control help at the start screen (done)
    * add optional restart game on win/fail (done)

@toDo 09.09 / 10.51
    * add bootstrap lib (done)
    * add win/fail modals (done)
    * add boundaries (done)

@toDo 09.09 / 11.40 
    * paddle control fix (done)
    * paddle speed increase (done)

@toDo 09.09 / 17.55
    * paddle corner hit issues (done)
    * remove debug info (done)
    * create js bundle (done)

@toDo 09.09 / 18.01
    * fix chrome@128.0.6613.120 collision issue (done)


To launch with webpack dev-server:
npm i
npm start