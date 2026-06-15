export class IndicatorsModule {
  static init() {
    const utmEl = document.getElementById('ind-utm')
    const ufEl = document.getElementById('ind-uf')
    const dolarEl = document.getElementById('ind-dolar')
    if (!utmEl) return

    const url = 'https://gambito700.github.io/scraperUTM/dashboard_data.json'

    fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
      .then(data => {
        let utm, uf, dolar
        if (data.previred) {
          utm = data.previred.utm_mayo
          uf = data.previred.uf_mayo
        } else {
          utm = data.utm
          uf = data.uf
        }
        if (data.sii && data.sii.dolar_diario && data.sii.dolar_diario.length) {
          const ultimo = data.sii.dolar_diario[data.sii.dolar_diario.length - 1]
          dolar = ultimo.valor
        } else {
          dolar = data.dolar
        }
        if (utm && utmEl) utmEl.textContent = '$' + Number(utm).toLocaleString('es-CL')
        if (uf && ufEl) ufEl.textContent = '$' + Number(uf).toLocaleString('es-CL')
        if (dolar && dolarEl) dolarEl.textContent = '$' + Number(dolar).toLocaleString('es-CL')
      })
      .catch(() => {
        if (utmEl) utmEl.textContent = 'No disponible'
        if (ufEl) ufEl.textContent = 'No disponible'
        if (dolarEl) dolarEl.textContent = 'No disponible'
      })
  }
}

export default IndicatorsModule
