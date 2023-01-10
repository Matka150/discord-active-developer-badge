const {Client, Events, REST, Routes, SlashCommandBuilder, Collection} = require('discord.js');
const client = new Client({intents: []});

const prompt = require('prompt');

let token;

prompt.get('token', function (err, result) {
    if (err) { return onErr(err); }
    token = result.token;
    client.login(token);
});

client.commands = new Collection();

const activate = {
	data: new SlashCommandBuilder()
		.setName('activate')
		.setDescription('Activation or renewal of badge.'),
	async execute(interaction) {
		await interaction.reply('Got it!');
	},
};

client.commands.set('activate', activate);

client.once(Events.ClientReady, client => {
    const clientId = client.application.id;
    console.log(`https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=105227086912`);

    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: [activate.data.toJSON()] },
            );
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});