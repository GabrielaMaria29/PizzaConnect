# **App Name**: PizzaConnect

## Core Features:

- Autenticação e Autorização Segura: Permitir que usuários façam login com e-mail e senha, com painéis e permissões distintas para perfis de Administrador e Vendedor, gerenciados via Firebase Authentication e regras do Firestore, garantindo acesso exclusivo ao conteúdo autorizado.
- Cadastro de Pedidos por Vendedor: Vendedores podem registrar novos pedidos de pizza usando um formulário intuitivo, com preenchimento automático do campo 'Quem vendeu' com base no usuário logado e seleção de sabores e formas de pagamento via checkboxes.
- Gerenciamento de Pedidos do Vendedor: Vendedores podem visualizar e editar apenas os pedidos que eles cadastraram, garantindo privacidade e foco na sua própria produtividade, com atualizações em tempo real dos dados via Cloud Firestore.
- Gerenciamento Total de Pedidos do Administrador: Administradores têm acesso completo para visualizar, editar e excluir todos os pedidos cadastrados na plataforma, com uma listagem detalhada, filtragem em tempo real e regras de segurança para total controle.
- Gerenciamento de Usuários Vendedores: O Administrador pode adicionar novos vendedores ao sistema, editar suas informações e ativar/desativar contas, controlando o acesso e a participação da equipe de vendas através de funcionalidades intuitivas.
- Dashboard Administrativo com Analíticos: Fornecer ao Administrador um painel com um resumo superior de dados chave, incluindo o total de pedidos, totais por sabor, totais por forma de pagamento e total por vendedor, tudo sincronizado em tempo real.
- Sincronização de Dados em Tempo Real: Garantir que todas as alterações nos pedidos e dados de usuários sejam refletidas instantaneamente para todos os usuários relevantes (administradores e vendedores) através da sincronização de dados do Cloud Firestore.

## Style Guidelines:

- Esquema de cores: Um esquema de cores leve e profissional que equilibra o calor do 'pizza' com a seriedade de um 'instituto', transmitindo modernidade e confiabilidade.
- Cor primária: Um marrom-avermelhado escuro e aconchegante (#87361F). Esta escolha evoca estabilidade, autenticidade e a essência artesanal da pizza, garantindo um bom contraste em um esquema claro.
- Cor de fundo: Um tom de branco-quente quase imperceptível (#FCF6F5). Proporciona uma tela limpa e serena para o conteúdo, garantindo alta legibilidade e um visual arejado.
- Cor de destaque: Um rosa-aveludado suave (#E8A1BA). Utilizado para ações importantes e elementos interativos, essa cor adiciona um toque de modernidade e sutileza sem ser invasiva, complementando a paleta principal.
- Fonte para títulos: 'Space Grotesk' (sans-serif), selecionada por seu design moderno e de forte impacto visual, ideal para headlines e destaques que capturam a atenção.
- Fonte para corpo de texto: 'Inter' (sans-serif), escolhida por sua clareza, alta legibilidade e eficiência em diversos tamanhos de tela, perfeita para formulários, tabelas e longos trechos de texto.
- Ícones: Adotar um estilo de ícone minimalista e com linhas finas, que mantém a consistência visual e facilita o reconhecimento, reforçando a simplicidade e modernidade da interface.
- Responsividade: Design totalmente responsivo que se adapta perfeitamente a dispositivos móveis e desktops. Com uma navegação clara (menu lateral ou superior) e abas bem definidas para módulos de Administrador e Vendedor.
- Animações: Utilizar animações sutis em transições de página e estados de carregamento (com indicadores como spinners ou esqueletos), além de mensagens visuais para confirmação de sucesso e alerta de erros, aprimorando a experiência do usuário.