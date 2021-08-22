export default (content: string) =>
    content.replace(/啊+$/, 'a')
        .replace(/了/g, '惹')
