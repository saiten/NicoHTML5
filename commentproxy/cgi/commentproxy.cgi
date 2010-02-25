#!/usr/bin/perl
use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Headers;
use HTTP::Request;
use CGI;
use XML::LibXML;
use JSON;

my $q = CGI->new();

my $ms        = $q->param("ms")       || "";
my $thread_id = $q->param("t")        || "";
my $res_from  = $q->param("res_from") || 200;
my $callback  = $q->param("callback") || "callback";
 
print $q->header( -type => "application/json" );

&error("invalid callback", "callback") unless($callback =~ /^[0-9a-zA-Z._\[\]]+$/);
&error("invalid ms", callback)         unless($ms =~ m!^http://msg.nicovideo.jp/\d+/api/$!);
&error("invalid thread_id", callback)  unless($thread_id =~ /^\d+$/);
&error("invalid res_from", callback)   unless($res_from =~ /^\d+$/);

my $ua = LWP::UserAgent->new();

my $h = HTTP::Headers->new();
$h->header( Content_Type => "text/xml" );
my $xml = qq|<thread res_from="-${res_from}" version="20061206" thread="${thread_id}">|;
my $req = HTTP::Request->new( POST => $ms, $h, $xml);
my $res = $ua->request($req);

&error("failed request : " . $res->status_line) unless($res && $res->is_success);

my $doc = XML::LibXML->new->parse_string($res->content);

my ($thread_node) = $doc->findnodes("//*[local-name()='thread']");
my $thread = {};
for my $attr ($thread_node->attributes) {
    $thread->{$attr->getName} = $attr->getValue;
}

my @chat_nodes = $doc->findnodes("//*[local-name()='chat']");
my @comments = ();
for my $node (@chat_nodes) {
    my $comment = {};
    for my $attr ($node->attributes) {
	$comment->{$attr->getName} = $attr->getValue;
    }
    $comment->{content} = $node->textContent;

    push @comments, $comment;
}

my $json = encode_json({ status => "ok", thread => $thread, comments => \@comments });

print qq|${callback}($json);|;
exit(0);

sub error {
    my ($msg, $callback) = @_;
    print qq|${callback}( { status: "ng", message: "$msg" } );|;
    exit(0);
}
