// const handsfree = new Handsfree({weboji: true})
const canvasDiv = document.getElementById('pdf-render');
const LEFT_CUTOFF=canvasDiv.getBoundingClientRect().left;
const RIGHT_CUTOFF=canvasDiv.getBoundingClientRect().right;
const url='../docs/cn-a-top-down-approach.pdf'
let startLooktime=Number.POSITIVE_INFINITY
const delay = 70
let timestamp=0
let toggleInput=false //false for gaze, true for handtracking
// handsfree.enablePlugins('browser')
// handsfree.start();
let lookDirection=null

// handsfree.use('logger', data => {
//     if (data==null) return
//     if (data.weboji && data.weboji.pointer) {
//     const xValue = data.weboji.pointer.x;
//     console.log(xValue);
//     const now = new Date();
//     if (xValue<LEFT_CUTOFF && lookDirection!=='LEFT'){
//         startLooktime=timestamp
//         lookDirection='LEFT'
//         console.log("startLooktime,lookDirection",startLooktime,lookDirection)
//     }else if(xValue>RIGHT_CUTOFF && lookDirection!=='RIGHT'){
//         startLooktime=timestamp
//         lookDirection='RIGHT'
//         console.log("startLooktime,lookDirection",startLooktime,lookDirection)
//     } else if(xValue>=LEFT_CUTOFF && xValue<=RIGHT_CUTOFF){
//         startLooktime=Number.POSITIVE_INFINITY
//         lookDirection=null
//     }
//     async function check(){
//         console.log("sltm,d,t,ld",startLooktime+delay,timestamp,lookDirection)
//     if (startLooktime+delay<timestamp){
//         console.log('here')
//         console.log(xValue,LEFT_CUTOFF,RIGHT_CUTOFF)
//         if (lookDirection==="LEFT") {
//             await showPrevpage();
//             startLooktime=Number.POSITIVE_INFINITY
//             lookDirection=null
//         }
//         else{
//             await showNextpage();
//             startLooktime=Number.POSITIVE_INFINITY
//             lookDirection=null
//         }
//     }
// }
// check();
// timestamp=timestamp+1
//     } else {
//     console.log('data.weboji.pointer is undefined');
//     }
// })

if (toggleInput==true){
let handsfree = new Handsfree({hands: true})
handsfree.enablePlugins('browser')
handsfree.start()
let inDrag=false
let startDrag=0
let distance=Number.POSITIVE_INFINITY
handsfree.use('logger', data =>{
    if (data==null) return
    if (data.hands && data.hands.pointer && data.hands.pinchState){
        if (data.hands.pointer[1].x){
            if (data.hands.pinchState[1][0]=="start" && inDrag==false && data.hands.pointer[1].x>RIGHT_CUTOFF){
                console.log("here")
                inDrag=true
                startDrag=data.hands.pointer[1].x
            }else if(inDrag==true && data.hands.pinchState[1][0]=="held"){
                console.log("adding")
            }else if (data.hands.pinchState[1][0]=="released" && data.hands.pointer[1].x<RIGHT_CUTOFF){
                inDrag=false
                distance=data.hands.pointer[1].x-startDrag
                console.log(distance)
                async function checkrighthand(distance){
                    if (distance<0){
                        startDrag=0
                        await showNextpage();
                    }
                }
                checkrighthand(distance)
            }
        }
        if (data.hands.pointer[0].x){
            console.log("inDrag",inDrag)
            console.log(data.hands.pinchState[0][0])
            if (data.hands.pinchState[0][0]=="start" && inDrag==false && data.hands.pointer[0].x<RIGHT_CUTOFF){
                inDrag=true
                startDrag=data.hands.pointer[0].x
                console.log("leftDrag")
            }else if(inDrag==true && data.hands.pinchState[0][0]=="held"){
                console.log("dragging")
            }else if (data.hands.pinchState[0][0]=="released" && data.hands.pointer[0].x>LEFT_CUTOFF){
                inDrag=false
                console.log("done dragging")
                distance=data.hands.pointer[0].x-startDrag
                console.log(distance)
                async function checklefthand(distance){
                    if (distance>0){
                        startDrag=0
                        await showPrevpage();
                    }
                }
                checklefthand(distance)
            }
        }
            
            // console.log('at right side',data.hands.pointer[1].x,data.hands.pinchState[1])
            // console.log(data.hands)
    }
})
}else{
    handsfree = new Handsfree({weboji: true})
    handsfree.enablePlugins('browser')
    handsfree.start();
    handsfree.use('logger', data => {
            if (data==null) return
            if (data.weboji && data.weboji.pointer) {
            const xValue = data.weboji.pointer.x;
            console.log(xValue);
            const now = new Date();
            if (xValue<LEFT_CUTOFF && lookDirection!=='LEFT'){
                startLooktime=timestamp
                lookDirection='LEFT'
                console.log("startLooktime,lookDirection",startLooktime,lookDirection)
            }else if(xValue>RIGHT_CUTOFF && lookDirection!=='RIGHT'){
                startLooktime=timestamp
                lookDirection='RIGHT'
                console.log("startLooktime,lookDirection",startLooktime,lookDirection)
            } else if(xValue>=LEFT_CUTOFF && xValue<=RIGHT_CUTOFF){
                startLooktime=Number.POSITIVE_INFINITY
                lookDirection=null
            }
            async function check(){
                console.log("sltm,d,t,ld",startLooktime+delay,timestamp,lookDirection)
            if (startLooktime+delay<timestamp){
                console.log('here')
                console.log(xValue,LEFT_CUTOFF,RIGHT_CUTOFF)
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
        check();
        timestamp=timestamp+1
            } else {
            console.log('data.weboji.pointer is undefined');
            }
        })
}
let pdfDoc=null,
pageNum=1,
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