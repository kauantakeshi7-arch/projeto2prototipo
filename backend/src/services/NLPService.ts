import { GoogleGenerativeAI } from '@google/generative-ai';
import { Intent } from './HardwareEngine';

export class NLPService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  public async extractIntent(budgetQuery: string): Promise<Intent> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' }); // Modelo mais rápido e barato
    
    const prompt = `
      Analise o texto: "${budgetQuery}"
      Seu único papel é extrair informações numéricas e categoria.
      - Tente achar um orçamento máximo em Reais (BRL).
      - Classifique a categoria entre: "office", "gaming", "heavy_gaming", "workstation". (Para GTA V, CSGO, LoL, classifique como "gaming". Para Cyberpunk, 4K, edição de vídeo, classifique como "heavy_gaming").
      
      Retorne EXATAMENTE um JSON válido com as chaves "budget" (numero inteiro) e "category" (string). Nada mais.
      Exemplo: {"budget": 4500, "category": "gaming"}
    `;

    try {
      const response = await model.generateContent(prompt);
      let text = response.response.text().trim();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      
      // Fallback seguro se a IA se confundir
      return {
        budget: typeof parsed.budget === 'number' ? parsed.budget : 3500,
        category: ['office', 'gaming', 'heavy_gaming', 'workstation'].includes(parsed.category) ? parsed.category : 'gaming'
      };
    } catch (e) {
      console.warn('NLP Engine falhou (limite de cota?), usando extrator Regex nativo.');
      return this.extractIntentRegex(budgetQuery);
    }
  }

  // Backup do backup se o Google cair
  private extractIntentRegex(query: string): Intent {
    // Remove todos os não-dígitos e pontos/vírgulas para interpretar PT-BR corretamente
    // Ex: R$ 4.500,00 -> 4500
    const match = query.match(/(\d+([\.,]\d+)*)/g);
    let budget = 3500;
    
    if (match) {
       // Pega o último número achado (ex: "pc gamer de 4.000")
       let rawNum = match[match.length - 1];
       // Limpa os decimais BR ",00"
       rawNum = rawNum.replace(/,\d{2}$/, '');
       // Remove os pontos
       rawNum = rawNum.replace(/\./g, '');
       budget = parseInt(rawNum, 10);
       
       if (isNaN(budget)) budget = 3500;
       if (budget < 100) budget = budget * 1000; // se o cara digitou "4k", interpretamos como 4 -> 4000
    }
    
    let category: Intent['category'] = 'gaming';
    const qLower = query.toLowerCase();
    if (qLower.includes('cyberpunk') || qLower.includes('4k') || qLower.includes('edição') || qLower.includes('pesado')) {
      category = 'heavy_gaming';
    } else if (qLower.includes('escritório') || qLower.includes('estudo') || qLower.includes('office')) {
      category = 'office';
    }
    
    return { budget, category };
  }
}
