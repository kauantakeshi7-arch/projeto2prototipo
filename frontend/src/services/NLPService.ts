import { GoogleGenerativeAI } from '@google/generative-ai';
import { Intent } from './HardwareEngine';

export class NLPService {
  private genAI?: GoogleGenerativeAI;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[NLPService] GEMINI_API_KEY não configurada. Usando fallback local (Regex).');
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  public async extractIntent(budgetQuery: string): Promise<Intent> {
    const prompt = `
      Você é um especialista em montagem de PCs. O usuário disse: "${budgetQuery}".
      Extraia o orçamento máximo em Reais (BRL) e a categoria de uso principal.
      Responda APENAS com um JSON válido no formato: {"budget": number, "category": "office" | "gaming" | "heavy_gaming" | "workstation"}
    `;

    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(prompt);
        let text = response.response.text().trim();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        
        return {
          budget: typeof parsed.budget === 'number' ? parsed.budget : 3500,
          category: ['office', 'gaming', 'heavy_gaming', 'workstation'].includes(parsed.category) ? parsed.category : 'gaming'
        };
      } catch (error) {
        console.error('[NLPService] Falha na IA Generativa, caindo para Fallback local.', error);
      }
    }

    return this.extractIntentRegex(budgetQuery);
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
