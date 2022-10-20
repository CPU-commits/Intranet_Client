export default async function(config: {
    total: number,
    fx: (n: number) => Promise<number>,
    max: number,
    element?: HTMLElement,
}) {
    // Init
    let count = config.max
    let running = false
    // Body
    let elementScroll: HTMLElement
    if (config.element){
        elementScroll = config.element
    }else{
        elementScroll = document.body
    }
    if(config.total > config.max) {
        elementScroll.onscroll = async () => {
            let myPosition: number
            if (elementScroll !== document.body) {
                myPosition = elementScroll.scrollTop + elementScroll.clientHeight
            }else{
                myPosition = elementScroll.clientHeight - (elementScroll.getBoundingClientRect().bottom - window.innerHeight)
            }
            if(myPosition / elementScroll.scrollHeight >= 0.6 && !running && count < config.total){
                running = true
                count = await config.fx(count)
                running = false
            }
        }
    }
}
