function thumbnail(f){
    var file = f.files;
    var reader = new FileReader();
    reader.onload=function(a){
        document.getElementById('thumbnail_image').innerHTML='<img src="'+a.target.result+'">'
        document.getElementById('thumbnail_image').children[0].setAttribute('width',250)        //썸네일이 담길 이미지 width값 300px로 고정     //이미지는 div 하위요소기 때문에 children으로 접근
        document.getElementById('thumbnail_image').style.height='250px';                        //썸네일이 담길 div의 height값 300px로 세팅해주고
        document.getElementById('thumbnail_image').style.overflow='hidden';                     //썸네일이 overflow되면 hidden으로 세팅
    }
    reader.readAsDataURL(file[0]);
}

function content_thumbnail(f){      //function이름이랑 id랑 같으면 in not a function 에러남;
    var file = f.files;
    var reader = new FileReader();
    reader.onload=function(a){
        document.getElementById('content_image2').innerHTML='<img src="'+a.target.result+'">'
    }
    reader.readAsDataURL(file[0]);
}

