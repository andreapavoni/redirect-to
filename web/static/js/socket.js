import {Socket} from "deps/phoenix/web/static/js/phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("links", {});
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) });

channel.on("update:link", payload => {
  const linkId = payload.link_id,
        linkVisitTableRowHtml = payload.link_visit_table_row_html,
        linkVisitTableRowSelector = `.link-visits[data-id='${linkId}'] tbody`;

  $(linkVisitTableRowSelector).prepend($(linkVisitTableRowHtml).addClass("created"));
});

channel.on("update:linkCount", payload => {
  const linkId = payload.link_id,
        linkListItemHtml = payload.link_list_item_html,
        linkListItemSelector = `.links [data-id='${linkId}']`;

  $(linkListItemSelector).html(linkListItemHtml);
});

channel.on("update:linkAnalytics", payload => {
  const linkId = payload.link_id,
        linkAnalyticsHtml = payload.link_analytics_html,
        linkAnalyticsSelector = `.analytics-wrapper[data-id='${linkId}']`;

  $(linkAnalyticsSelector).replaceWith(linkAnalyticsHtml);
  $("[data-role='analytics-graph']").each(function() {
    new PieChart($(this), google).run();
  });

  $("[data-role='analytics-geo']").each(function() {
    new GeoChart($(this), google).run();
  });
});

export default socket;
