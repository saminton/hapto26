


window.addEventListener('load', ()=>{
	
	let titleEl = document.querySelector('#titlewrap #title');
	
	if(!titleEl) return null;
	const value = titleEl.value
	
	
	titleEl.outerHTML = titleEl.outerHTML.replace(/input/g,"textarea");
	titleEl = document.getElementById('title');
	titleEl.innerText = value
	
	titleEl.style.height = titleEl.scrollHeight + 'px'
	titleEl.style.resize = 'none'
	titleEl.style.overflow = 'hidden'
	
	const fit = () => {
		titleEl.style.height = ''
		titleEl.style.height = titleEl.scrollHeight + 'px'
	}
	
	const keydown = (e) => {
		if(e.keyCode === 13) e.preventDefault()
		titleEl.scrollTo(0, 0)
	}
	
	window.addEventListener('resize', fit)
	titleEl.addEventListener('keyup', fit)
	titleEl.addEventListener('keydown', keydown)
	fit();
	
})