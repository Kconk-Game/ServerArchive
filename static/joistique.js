let outercircleleft = document.createElement("div");
document.body.appendChild(outercircleleft);
outercircleleft.style.backgroundColor = "lightgrey";
outercircleleft.style.height = "150px";
outercircleleft.style.width = "150px";
outercircleleft.style.borderRadius = "50%";
outercircleleft.style.opacity = "50%";
outercircleleft.style.border = "1px hidden";
outercircleleft.style.position = "relative";
outercircleleft.id = "ocl";

let innercircleleft = document.createElement("div");
outercircleleft.appendChild(innercircleleft);
innercircleleft.style.backgroundColor = "grey";
innercircleleft.style.height = "75px";
innercircleleft.style.width = "75px";
innercircleleft.style.borderRadius = "50%";
innercircleleft.style.opacity = "50%";
innercircleleft.style.border = "1px hidden";
innercircleleft.id = "icl";

innercircleleft.style.position = "absolute";
innercircleleft.style.left = "25%";
innercircleleft.style.top = "25%";

let oclx, ocly, iclx = 0, icly = 0;

function move(e) {
  const rect = outercircleleft;
  oclx = rect.getBoundingClientRect().x + 75;
  ocly = rect.getBoundingClientRect().y + 75;
  
  if (e.touches) {
   iclx = e.touches.item(0).clientX - oclx;
   icly = e.touches.item(0).clientY - ocly;
  }
  else if (e) {
   iclx = e.clientX - oclx;
   icly = e.clientY - ocly;
  }
  
  const distance = Math.sqrt(iclx ** 2 + icly ** 2) / 37.5;

  if (distance > 1) {
    iclx /= distance;
    icly /= distance;
  }
  innercircleleft.style.left = `${iclx + 37.5}px`;
  innercircleleft.style.top = `${icly + 37.5}px`;
  e.preventDefault()
}

function stop(e) {
 innercircleleft.style.top = "25%";
 innercircleleft.style.left = "25%";
 e.preventDefault()
 window.removeEventListener("mousemove", move)
 window.removeEventListener("mouseup", stop)
}

innercircleleft.addEventListener("mousedown", function(e) {
  window.addEventListener("mousemove", move),
  window.addEventListener("mouseup", stop)
});

outercircleleft.addEventListener("touchmove", move)

window.addEventListener("touchend", stop);

let motionx = iclx/37.5
let motiony = icly/37.5