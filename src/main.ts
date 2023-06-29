import './style.css'
import { Crossword } from './crossword.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="crossword"></div>
  <button id="button-capture">Capture</button>
`
const crosswordElem = document.querySelector<HTMLElement>('#crossword')!
const captureButtonElem = document.querySelector('#button-capture')

const arr = ['c', 'a', 'l', '⬛', '⬜', '⬜', 'o', 'p', 'a', 'l', 'o', 's', 'm', 'e', '⬛', 'i', 'z', 'a', 'p', 'a', 'l', 'a', '⬛', 'l', 'r', '⬛', '⬜', 'r', '⬛', 't', 'e', '⬜', 'm', '⬛', '⬛', 'e', 'l', 'l', 'e', 'v', 'a', 'n', 'a', '⬛', '⬛', 'i', '⬛', '⬛', '⬜', 'c', 'a', 'o', 'b', 'a']
// const arr = new Array(54).fill("")

const crossword = new Crossword(crosswordElem, 6, 9, arr,  true)


captureButtonElem?.addEventListener('pointerdown', () => {
  crossword.capture(crosswordElem)
})


