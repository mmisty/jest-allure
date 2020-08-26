
export async function delay(ms: number, ...messages: string[]) : Promise<void>{
    console.log(
        ...messages,
        messages.length > 0 ? ':' : '',
        `DELAY ${ms.toString()} ms`,
    );
    await new Promise((resolve) => setTimeout(resolve, ms));
}