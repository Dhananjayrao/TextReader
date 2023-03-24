const canvasDiv = document.getElementById('pdf-render');
const LEFT_CUTOFF=canvasDiv.getBoundingClientRect().left;
const RIGHT_CUTOFF=canvasDiv.getBoundingClientRect().right;
const RIGHT_END=window.screen.width;
const HEIGHT=window.screen.height;
const url=localStorage.getItem('url');
let startLooktime=Number.POSITIVE_INFINITY
const delay = 70
let timestamp=0
let eyeCount=0
let handCount=0
let pageNum=JSON.parse(localStorage.getItem('pageNum'))

const radios = document.querySelectorAll('input[name="btnradio"]');
let selectedValue;
console.log(radios);for (const radio of radios) {
  radio.addEventListener('change', () => {
    const selectedValue = document.querySelector('input[name="btnradio"]:checked').value;
    localStorage.setItem('selectedValue', selectedValue);
    localStorage.setItem('pageNum',JSON.stringify(pageNum))
    location.reload();
    // perform action or update UI based on selectedValue
  });
}

document.getElementById("txtpageNum").addEventListener("keyup", function(event) {
    if (event.key==="Enter"){
        let input = document.getElementById("txtpageNum").value.trim();
        if (!isNaN(input)) {
            pageNum = Number(input);
            renderPage(pageNum);
        }
        document.getElementById("txtpageNum").value = '';
}
});


const storedValue = localStorage.getItem('selectedValue');
if (storedValue) {
  const radio = document.querySelector(`input[name="btnradio"][value="${storedValue}"]`);
  radio.checked = true;
  // perform action or update UI based on storedValue
  if (localStorage.getItem('pageNum')){
        pageNum=JSON.parse(localStorage.getItem('pageNum'))
    }
}



window.addEventListener('beforeunload', function(event) {
    // Check if the unload event is also fired
    if (event.type === 'unload') {
      // Set the pageNum variable in localStorage to 1
      localStorage.clear();
    }
  });

let lookDirection=null



if (selectedValue==="Gesture" || storedValue==="Gesture"){
let handsfree = new Handsfree({hands: true,maxNumHands:2,minTrackingConfidence:0.7, plugin: {pinchScroll: {enabled: true,}}})
handsfree.enablePlugins('browser')
handsfree.start()
let inDrag=false
let startDrag=0
let distance=Number.POSITIVE_INFINITY
handsfree.use('logger', data =>{
    if (data==null) return
    if (data.hands && data.hands.pointer && data.hands.pinchState){
        if (data.hands.pointer[1].x){
            if (data.hands.pinchState[1][0]=="held" && data.hands.pinchState[1][1]=="held" && data.hands.pinchState[1][2]=="held" && data.hands.pinchState[1][3]=="held"){
                console.log(data.hands.pinchState,handCount)
                handCount+=1
                if (handCount>=30){
                    window.location.href="index.html"
                }
            }else{
                handCount=0
            }
            if (data.hands.pinchState[1][0]=="start" && inDrag==false && data.hands.pointer[1].x>RIGHT_CUTOFF){
                inDrag=true
                startDrag=data.hands.pointer[1].x
            }
            else if(inDrag==true && (data.hands.pinchState[1][0]!="released" || data.hands.pinchState[1][0]=="")){
                if (i>500){
                    i=0
                    inDrag=false
                    startDrag=0
                }
                i+=1
            }
            else if (inDrag==true && data.hands.pinchState[1][0]=="released" && data.hands.pointer[1].x<RIGHT_CUTOFF && data.hands.pointer[1].x>LEFT_CUTOFF){
                inDrag=false
                distance=data.hands.pointer[1].x-startDrag
                async function checkrighthand(distance){
                    if (distance<0){
                        startDrag=0
                        i=0
                        await showNextpage();
                    }
                }
                checkrighthand(distance)
            }
            i+=1
        }
        if (data.hands.pointer[0].x){
            if (data.hands.pinchState[0][0]=="held" && data.hands.pinchState[0][1]=="held" && data.hands.pinchState[0][2]=="held" && data.hands.pinchState[0][3]=="held"){
                handCount+=1
                if (handCount>=30){
                    window.location.href="index.html"
                }
            }else{
                handCount=0
            }
            if (data.hands.pinchState[0][0]=="start" && inDrag==false && data.hands.pointer[0].x<LEFT_CUTOFF){
                inDrag=true
                startDrag=data.hands.pointer[0].x
            }else if(inDrag==true && data.hands.pinchState[0][0]!="released"){
                if (i>1000){
                    i=0
                    inDrag=false
                    startDrag=0
                }
                i+=1
            }else if (data.hands.pinchState[0][0]=="released" && data.hands.pointer[0].x>LEFT_CUTOFF && inDrag==true){
                inDrag=false
                distance=data.hands.pointer[0].x-startDrag
                async function checklefthand(distance){
                    if (distance>0){
                        i=0
                        startDrag=0
                        await showPrevpage();
                    }
                }
                checklefthand(distance)
            }
            i+=1
        }
    }else{
        inDrag=false
        i=0
    }
})
}else{
    handsfree = new Handsfree({weboji:true})
    handsfree.enablePlugins('browser')
    handsfree.start();
    handsfree.use('logger', data => { 
            if (data==null) return
            if(data.weboji.isDetected){
                if (data.weboji.translation[2]<0.19){ //check to see if user is too far away from the screen
                    alert('You may be too far away from the screen to reliably detect your gaze, please readjust your position')
                }
            }
            // console.log(data.weboji.state.eyesClosed,eyeCount)
            if (data.weboji.state.eyesClosed==true){
                //go back to index by closing your eyes
                eyeCount+=1
                if (eyeCount>=10){
                    eyeCount=0
                    window.location.href="index.html";
                }
                }else{
                    eyeCount=0
                }
            if (data.weboji && data.weboji.pointer) {
                const xValue = data.weboji.pointer.x;
                const yValue=data.weboji.pointer.y;
                if (xValue<-50 || xValue>RIGHT_END+50 || yValue<0 || yValue>HEIGHT) return
                if (xValue<LEFT_CUTOFF && lookDirection!=='LEFT'){
                    startLooktime=timestamp
                    lookDirection='LEFT'
                }else if(xValue>RIGHT_CUTOFF && lookDirection!=='RIGHT'){
                    startLooktime=timestamp
                    lookDirection='RIGHT'
                } else if(xValue>=LEFT_CUTOFF && xValue<=RIGHT_CUTOFF){
                    startLooktime=Number.POSITIVE_INFINITY
                    lookDirection=null
                }
                async function gazecheck(){
                if (startLooktime+delay<timestamp){
                    if (lookDirection==="LEFT") {
                        await showPrevpage();
                        startLooktime=Number.POSITIVE_INFINITY
                        lookDirection=null
                    }
                    else{
                        await showNextpage();
                        startLooktime=Number.POSITIVE_INFINITY
                        lookDirection=null
                    }
                }
            }
            gazecheck();
            timestamp=timestamp+1
            } else {
                console.log('data.weboji.pointer is undefined');
                }
        })
}
let pdfDoc=null;
pageIsRendering=false;
pageNumispending=null;

const scale=1.5,
canvas=document.querySelector('#pdf-render'),
ctx=canvas.getContext('2d');
const renderPage=num=>{
    pageIsRendering=true;
    pdfDoc.getPage(num).then(page =>{
        const viewport=page.getViewport({scale});
        canvas.height=viewport.height;
        canvas.width=viewport.width;
        const renderCtx={
            canvasContext:ctx,
            viewport
        }
        page.render(renderCtx).promise.then(() => {
            pageIsRendering=false;
            if (pageNumispending !== null){
                renderPage(pageNumispending);
                pageNumispending=null;
            }
        });
        document.querySelector("#page-num").textContent=num;
    })
}

const queueRenderPage = num =>{
    if (pageIsRendering){
        pageNumispending=num;
    }else{
        renderPage(num);
    }
}

const showPrevpage = () =>{
    if (pageNum <= 1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

const showNextpage = () => {
    if (pageNum >= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
pdfDoc=pdfDoc_;
console.log(pdfDoc);
document.querySelector('#page-count').textContent=pdfDoc.numPages;
renderPage(pageNum);
});

//button events
document.querySelector("#prev-page").addEventListener('click',showPrevpage);
document.querySelector("#next-page").addEventListener('click',showNextpage);