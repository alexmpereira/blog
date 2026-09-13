# ANÁLISE COMPARATIVA DE COMPLEXIDADE CICLOMÁTICA E COGNITIVA EM ARQUITETURAS WEB: ABORDAGEM HYPERMEDIA-DRIVEN (HTMX) VERSUS CLIENT-SIDE RENDERING (REACT)

**Alex Morgado Pereira**

_Colaborador: [João Gabriel Grande](https://github.com/JGGrande)_

**Link da POC prático: https://github.com/alexmpereira/estudo-htmx-vs-react**

## RESUMO
O desenvolvimento de software moderno enfrenta desafios crescentes relacionados à complexidade acidental introduzida por frameworks baseados em JavaScript, que frequentemente priorizam a experiência do desenvolvedor em detrimento da eficiência arquitetural. Este estudo investiga a eficácia da biblioteca HTMX em comparação ao React, focando na redução da sobrecarga cognitiva e instrumental associada à gestão de estado no cliente. Através de uma análise comparativa arquitetural, implementou-se o padrão de interface de edição inline em ambos os paradigmas para avaliar métricas de Linhas de Código e Localidade de Comportamento. A metodologia evidenciou que, enquanto o modelo React exigiu a sincronização manual de múltiplos estados mutáveis e dependência de APIs JSON, a abordagem HTMX permitiu uma implementação declarativa alinhada aos princípios HATEOAS. Os resultados quantitativos demonstraram uma redução de 71% no volume de código e a eliminação da complexidade ciclomática no front-end ao utilizar a abordagem orientada a hipermídia. Conclui-se que o retorno aos fundamentos da arquitetura REST, viabilizado pelo HTMX, oferece uma solução robusta para a fadiga do JavaScript, promovendo sistemas mais manuteníveis e performáticos ao remover a duplicidade de lógica entre cliente e servidor.

## INTRODUÇÃO
O desenvolvimento de software web contemporâneo tem sido caracterizado pela predominância das Single Page Applications (SPAs). Contudo, Vepsäläinen et al. (2023) argumentam que, embora a geração atual de frameworks JavaScript tenha priorizado a experiência do desenvolvedor (DX), essa escolha frequentemente ocorre em detrimento da experiência do usuário (UX), resultando em aplicações que enviam quantidades excessivas de scripts para o cliente. Embora bibliotecas como o React permitam interfaces reativas, elas introduzem uma "complexidade acidental" significativa ao dissociar o estado do cliente do servidor.

Em contraste com a simplicidade da arquitetura original da Web, Ollila, Mäkitalo e Mikkonen (2022) demonstram que as estratégias de renderização adotadas por bibliotecas ou frameworks modernas como o React impõem custos crescentes de desempenho à medida que a complexidade dos componentes aumenta, exigindo mecanismos sofisticados de gestão de estado e "diffing" no navegador para manter a consistência da interface. Neste contexto, o HTMX surge como uma ferramenta que busca mitigar essa sobrecarga, restaurando a simplicidade arquitetural descrita por Gross et al. (2023) e permitindo interatividade dinâmica sem a necessidade de uma gestão de estado complexa no cliente.

## OBJETIVO
O objetivo deste estudo foi analisar comparativamente a complexidade arquitetural e cognitiva entre o desenvolvimento baseado em componentes JavaScript (Client-Side Rendering) e a abordagem orientada a hipermídia (Hypermedia-Driven), visando quantificar a redução de linhas de código e a simplificação da manutenção ao adotar a biblioteca HTMX em detrimento do React.

## METODOLOGIA
Realizou-se uma Análise Comparativa Arquitetural qualitativa e quantitativa. Como estudo de caso, utilizou-se o padrão de interface "Click-to-Edit" (edição inline), conforme definido nos exemplos canônicos de Gross (2020). Foram implementados dois protótipos funcionais para o mesmo requisito:

* **Cenário A:** Utilizando React com Hooks para gestão de estado e Axios para comunicação via API REST/JSON.
* **Cenário B:** Utilizando HTMX com atributos estendidos e renderização de fragmentos HTML (SSR).

As métricas avaliadas foram: Linhas de Código (LOC) e adesão ao princípio da Localidade de Comportamento (LoB).

O cenário base para análise teórica foi um formulário de edição de dados com validação inline. No modelo React, considerou-se o uso de Hooks (useState, useEffect), bibliotecas de gerenciamento de formulários (ex: React Hook Form) e comunicação via API REST JSON. No modelo HTMX, considerou-se o uso de atributos estendidos (hx-post, hx-target) e renderização de fragmentos HTML pelo servidor.

## RESULTADOS / ANÁLISES
A análise dos dados demonstrou uma disparidade significativa na complexidade de implementação.

No Cenário A (React), observou-se a necessidade de gestão explícita de três estados mutáveis (view, edit, loading), confirmando a duplicidade de estado criticada por Fielding (2000) em sistemas distribuídos mal projetados:

```jsx
// React Component (JSX)
import { useState } from 'react';
import axios from 'axios';

function UserProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 1. Serialização para JSON
      await axios.put(`/api/users/${user.id}`, { name });
      setIsEditing(false);
    } catch (error) {
      alert("Erro ao salvar"); // Gestão de erro simplificada
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        <button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
        <button onClick={() => setIsEditing(false)}>Cancelar</button>
      </div>
    );
  }

  return (
    <div>
      <span>{name}</span>
      <button onClick={() => setIsEditing(true)}>Editar</button>
    </div>
  );
}
```

Em contrapartida, o Cenário B (HTMX) eliminou a necessidade de JavaScript imperativo, mantendo o estado unificado no servidor conforme preconizado por Gross et al. (2023):

```html
<div hx-target="this" hx-swap="outerHTML">
  <div>Nome: Alex</div>
  <button hx-get="/users/1/edit">Editar</button>
</div>

<form hx-put="/users/1" hx-target="this" hx-swap="outerHTML">
  <input name="name" value="Alex">
  <button type="submit">Salvar</button>
  <button hx-get="/users/1">Cancelar</button>
</form>
```

**Análise do Cenário B:** A lógica de controle de fluxo é declarativa. Não há variáveis de estado (useState), nem handlers de eventos explícitos. O atributo `hx-swap="outerHTML"` instrui o mecanismo a substituir o DOM atual pela resposta do servidor. A complexidade ciclomática no cliente é zero.

### Comparativo de Métricas de Código
A análise dos dois blocos de código acima revela disparidades significativas:

| Métrica | React (SPA) | HTMX (Hypermedia) | Redução |
| :--- | :--- | :--- | :--- |
| **Linhas de Código (LOC)** | ~35 linhas (JS+JSX) | ~10 linhas (HTML puro) | 71% |
| **Conceitos Necessários** | Hooks, Async/Await, Virtual DOM, JSON | HTML, Atributos HTTP | Baixa |
| **Gestão de Estado** | Cliente (Duplicado) | Servidor (Único) | N/A |
| **Build Step** | Obrigatório (Webpack/Vite) | Opcional/Inexistente | Total |

### Localidade de Comportamento (LoB)
O exemplo React viola o princípio da Localidade de Comportamento ao separar a definição da UI (JSX) da lógica de interação (handleSave, useEffect). O desenvolvedor precisa saltar visualmente pelo arquivo para entender o que um botão faz.

No exemplo HTMX, o comportamento está encapsulado no elemento: `<button hx-get...>` diz exatamente o que ocorrerá, cumprindo o princípio HATEOAS onde a própria hipermídia guia o estado da aplicação.

### CONCLUSÃO
Conclui-se que o HTMX oferece uma alternativa arquiteturalmente superior para aplicações que buscam reduzir a fadiga do JavaScript (JavaScript Fatigue). Ao respeitar o princípio da Localidade de Comportamento (LoB), a abordagem Hypermedia-Driven centraliza a lógica de negócios, facilitando a manutenção. Este estudo corrobora a visão de Fielding (2000) e a análise de Pautasso et al. (2008) de que a arquitetura REST, quando aplicada corretamente via HATEOAS, elimina a necessidade de acoplamento excessivo no cliente, embora limitações possam existir em cenários de alta interatividade offline.

### PALAVRA-CHAVE
Desenvolvimento Web, HTMX, React, REST, Localidade de Comportamento, Arquitetura de Software

### REFERÊNCIAS
- Vepsäläinen et al. (2023): VEPSÄLÄINEN, J.; HELLAS, A.; VUORIMAA, P. The State of Disappearing Frameworks in 2023. Proceedings of the 2023 ACM Conference....

- Ollila et al. (2022): OLLILA, R.; MÄKITALO, N.; MIKKONEN, T. Modern Web Frameworks: A Comparison of Rendering Performance. Journal of Web Engineering, v. 21, n. 3, p. 789-814, 2022.

- GROSS, Carson; STEPINSKI, Adam. Hypermedia Systems. 1. ed. [S.I.]: Big Sky Software, 2023. Disponível em: https://hypermedia.systems.

- FIELDING, Roy T. Architectural Styles and the Design of Network-based Software Architectures. 2000. Tese (Doutorado em Informação e Ciência da Computação) - University of California, Irvine, 2000.

- PAUTASSO, Cesare; ZIMMERMANN, Olaf; LEYMANN, Frank. RESTful Web Services vs. "Big" Web Services: Making the Right Architectural Decision. In: Proceedings of the 17th International Conference on World Wide Web (WWW '08). Beijing, China: ACM, 2008. p. 805-814.

- ΜΕΤΑ. Thinking in React. React Documentation. 2023. Disponível em: https://react.dev/learn/thinking-in-react.