import Bot from '../bot';
import { Command } from '../command';
import { capitalize } from '../utils';





class HelpCmd extends Command {

  get help() { return Strings.getHelp(); }


  constructor(bot: Bot) {
    super(['help', 'hlp', '?'], Bot.Role.Everyone, bot);
  }


  _instructions(cmdAsStr: string): void {
    if (!cmdAsStr) return this._instructions('help');
    const cmd =
      this._bot.commands.find(c => c.aliases.includes(cmdAsStr))
    ;
    if (!cmd) return (
      this._bot.sendMedMsg(Strings.getIsMissingCmd(cmdAsStr))
    );
    if (!cmd.help) return (
      this._bot.sendHighMsg(
        Strings.getIsMissingHelp(cmd.aliases[0]),
        'Command has no help'
      )
    );
    this._displayHelp(cmd);
  }

  private _displayHelp(cmd: Command) {
    this._bot.sendLowMsg(
      `${this._genHelpHeader(cmd)}\n${cmd.help}\n${this._genHelpFooter(cmd)}`,
      `${this._genHelpTitle(cmd)}`
    );
  }

  private _genHelpHeader(cmd: Command) {
    const aliases =
      `\`\`\`${cmd.aliases.map(v => `;${v}`).join(', ')}\`\`\``
    ;
    return (
      cmd.aliases.length > 1
        ? `**Aliases**\n${aliases}`
        : ''
    );
  }

  private _genHelpFooter(cmd: Command) {
    const aliasList =
      cmd.aliases.reduce(
        (str, alias, i) => (
          i == cmd.aliases.length - 1
            ? str += `*and* \`;${alias}\``
            : str += `\`;${alias}\` `
        ), ''
      )
    ;
    return cmd.aliases.length > 1
      ? Strings.getHelpFooter(aliasList)
      : ''
    ;
  }

  private _genHelpTitle(cmd: Command) {
    return `${capitalize(cmd.aliases[0])} Command`;
  }

}



namespace Strings {

  const curseEmoji = ':face_with_symbols_over_mouth:';

  export const getHelp = () => (
`**Command Help**
Displays the default help text for the specified \`<cmdname>\`. Any
time you need to know how to use a command, use the following
syntax.
\`\`\`;help <cmdname>\`\`\`
**Help with Help** *(What?)*
Using this command without any arguments, will bring up the
help display that you're reading right now.
\`\`\`;help\`\`\``
  );

  export const getIsMissingCmd = (cmd: string) => (
`:thinking:...\`${cmd}\` isn't a command that I'm aware of.`
  );

  export const getIsMissingHelp = (cmd: string) => (
`Jaeiya is a bad boy!! ${curseEmoji} He forgot to add a description
to the \`${cmd}\` command.

**Make sure you yell at him thoroughly for me!**`
  );

  export const getHelpFooter = (aliasList: string) => (
`*Don't forget that* ${aliasList} *are interchangeable.*`
  );
}
export = HelpCmd;