export const ChannelQueries = {
  GetChannelId: `
 select id 
 from channel
 where c_name = ? and admin = ?
  `,

  JoinChannel: `
  insert into channel_user (user_id, channel_id )
  values (?, ?)
  `,

  AddChannel: `
  insert into channel (admin, c_name)
  values (?, ?)
  `,
};
