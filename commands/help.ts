import Bot from '../bot';
import { Command } from '../command';
import { capitalize } from '../utils';



class HelpCmd extends Command {

  get help() {
    return (
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
  }


  constructor(public bot: Bot) {
    super(['help', 'hlp', '?'], Bot.Role.Everyone);
  }


  _instruction(cmdStr: string): void {
    if (!cmdStr) return void this._instruction('help')
    ;
    const cmd = this.bot.commands.find(c => c.aliases.includes(cmdStr))
    ;
    if (!cmd) return this.bot.sendMedMsg(
      'Sorry, I could\'t find that command.'
    );
    if (!cmd.help) return this.bot.sendHighMsg(
      'Jaeiya is a bad boy!! :face_with_symbols_over_mouth:\n' +
      'He forgot to add a description to the help command. ' +
      '\n\n**Make sure you yell at him thoroughly for me!**.',
      'Command Has No Help'
    );
    this._displayHelp(cmd);
  }


  private _displayHelp(cmd: Command) {
    this.bot.sendLowMsg(
      `${this._genHelpHeader(cmd)}\n${cmd.help}\n${this._genHelpFooter(cmd)}`,
      `${this._genHelpTitle(cmd)}`
    );
  }


  private _genHelpHeader(cmd: Command) {
    const aliases = `\`\`\`${cmd.aliases.map(v => `;${v}`).join(', ')}\`\`\``
    ;
    return cmd.aliases.length > 1
      ? `**Aliases**\n${aliases}`
      : ''
    ;
  }


  private _genHelpFooter(cmd: Command) {
    const aliasList = cmd.aliases.reduce(
      (str, alias, i) => (
        i == cmd.aliases.length - 1
          ? str += `*and* \`;${alias}\``
          : str += `\`;${alias}\` `
      ), ''
    );
    return cmd.aliases.length > 1
      ? `*Don't forget that* ${aliasList} *are interchangeable.*`
      : ''
    ;
  }


  private _genHelpTitle(cmd: Command) {
    return `${capitalize(cmd.aliases[0])} Command`;
  }
}

export = HelpCmd;