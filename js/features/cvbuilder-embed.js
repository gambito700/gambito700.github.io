/* FIRMA DIGITAL - gambito700 */
/**
 * EMBEBIDO DEL CV BUILDER
 * @module features/cvbuilder-embed
 *
 * El CV Builder vive en su propio repo y se publica como Pages aparte
 * (https://gambito700.github.io/cv-builder-public/). Aqui solo se
 * embebe dentro de una ventana del escritorio.
 *
 * Por que iframe y no fusionar el codigo: el builder trae su propio
 * sistema de diseno (tokens, tipografia, reset). Mezclar sus CSS con
 * los del portafolio produce colisiones en los dos sentidos. El iframe
 * aisla ambos contextos por completo.
 *
 * La URL vive en config.js (EMBEDS.CV_BUILDER.url). Al ser relativa se
 * resuelve contra el documento, asi que el mismo archivo sirve en el
 * sitio publicado y en un server local.
 */

import { EMBEDS } from '../config.js'

class CVBuilderEmbed {
  constructor() {
    this.win = null
    this.frame = null
    this.src = null
  }

  init() {
    const cfg = EMBEDS.CV_BUILDER
    this.win = document.getElementById(cfg.windowId)
    this.frame = document.getElementById(cfg.frameId)
    if (!this.win || !this.frame) {
      console.warn('[cvbuilder] ventana o iframe no encontrado; revisa EMBEDS en config.js')
      return
    }

    // Resolver contra el documento convierte la ruta relativa en
    // absoluta y quita la dependencia de donde este el iframe.
    this.src = new URL(cfg.url, document.baseURI).href

    // window-manager dispara 'window-show' al abrir cada ventana. El src
    // se asigna en la PRIMERA apertura y no mas: cargarlo en el arranque
    // descargaria CSS, scripts e imagenes para un visitante que quiza
    // nunca abra el builder. Con once:true el listener se retira; el
    // iframe conserva su src en las aperturas siguientes.
    this.win.addEventListener('window-show', () => {
      if (this.frame.getAttribute('src') !== this.src) {
        this.frame.setAttribute('src', this.src)
        console.log('[cvbuilder] iframe cargado desde', this.src)
      }
    }, { once: true })
  }
}

export const CVBuilderEmbedInstance = new CVBuilderEmbed()
export default CVBuilderEmbed
