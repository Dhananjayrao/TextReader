let startLooktime=Number.POSITIVE_INFINITY
const delay = 2000
// const LEFT_CUTOFF=window.innerWidth/4  //left margin of page
// const RIGHT_CUTOFF=window.innerWidth-(window.innerWidth/4) //right margin of page
const canvasDiv=document.getElementById('pdf-render');
const LEFT_CUTOFF=canvasDiv.getBoundingClientRect().left;
const RIGHT_CUTOFF=canvasDiv.getBoundingClientRect().right;
console.log(LEFT_CUTOFF,RIGHT_CUTOFF)
let lookDirection=null
window.saveDataAcrossSessions=true
webgazer.setGazeListener((data,timestamp) => {
    if (data==null) return
    if (data.x<LEFT_CUTOFF && lookDirection!=='LEFT'){
        startLooktime=timestamp
        lookDirection='LEFT'
    } else if(data.x>RIGHT_CUTOFF && lookDirection!=='RIGHT'){
        startLooktime=timestamp
        lookDirection='RIGHT'
    } else if(data.x>=LEFT_CUTOFF && data.x<=RIGHT_CUTOFF){
        startLooktime=Number.POSITIVE_INFINITY
        lookDirection=null
    }
    async function check(){
        if (startLooktime+delay<timestamp){
            console.log('here')
            console.log(data.x,LEFT_CUTOFF,RIGHT_CUTOFF)
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
}).begin()

const url='../docs/cn-a-top-down-approach.pdf';
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