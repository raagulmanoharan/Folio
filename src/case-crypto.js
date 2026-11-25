const base = import.meta.env.BASE_URL
const memory = new Map()
const from64 = value => Uint8Array.from(atob(value), char => char.charCodeAt(0))
const to64 = value => btoa(String.fromCharCode(...new Uint8Array(value)))
const keyName = slug => `folio-case-key:${slug}`

async function envelope(slug) {
  if (!/^[a-z-]+$/.test(slug)) throw new Error('Invalid project')
  if (!memory.has(slug)) {
    memory.set(slug, fetch(`${base}protected/${slug}.json`).then(response => {
      if (!response.ok) throw new Error('Unable to load this case study. Please try again.')
      return response.json()
    }).catch(error => { memory.delete(slug); throw error }))
  }
  return memory.get(slug)
}

async function decrypt(data, rawKey) {
  const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['decrypt'])
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: from64(data.iv) }, key, from64(data.ciphertext))
  return new TextDecoder().decode(plain)
}

export async function unlockCase(slug, password) {
  const data = await envelope(slug)
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const rawKey = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: from64(data.salt), iterations: data.iterations, hash: 'SHA-256' }, material, 256)
  const html = await decrypt(data, rawKey)
  // Per-tab access survives the navigation without storing the password.
  sessionStorage.setItem(keyName(slug), to64(rawKey))
  return html
}

export async function restoreCase(slug) {
  const stored = sessionStorage.getItem(keyName(slug))
  if (!stored) return null
  try { return await decrypt(await envelope(slug), from64(stored)) }
  catch { sessionStorage.removeItem(keyName(slug)); return null }
}
