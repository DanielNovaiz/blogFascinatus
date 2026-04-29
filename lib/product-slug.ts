/**
 * Gera um slug legível a partir do nome do produto
 * Exemplo: "Camiseta Azul" → "camiseta-azul"
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s-]/g, '') // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // replace espaços com hífen
    .replace(/-+/g, '-'); // remove hífens múltiplos
}

/**
 * Extrai o UUID do slug (útil quando slug é "nome-da-coisa-{uuid}")
 * Por agora usa o slug inteiro como identificador
 */
export function extractProductId(slug: string): string {
  // Se for UUID direto, retorna
  if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return slug;
  }
  // Senão, usa o slug como está (pode ser tratado depois)
  return slug;
}
