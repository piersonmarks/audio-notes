import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { connection } from "next/server";
import { getAllInboundEmails } from "@/lib/db/queries";
import { AddEmailDialog } from "@/components/add-email-dialog";
import { EmailRowActions } from "@/components/email-row-actions";
import { AllowedSendersCell } from "@/components/allowed-senders-cell";

export async function EmailList() {
  await connection();
  const users = await getAllInboundEmails();

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="mb-2 text-lg font-medium">No email addresses yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create an inbound email address to start processing audio notes.
          </p>
          <AddEmailDialog label="Add Your First Email" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Addresses</CardTitle>
        <CardDescription>
          Manage your inbound audio processing email addresses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inbound Email</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Allowed Senders</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell className="font-mono text-sm">
                  {user.email}
                </TableCell>
                <TableCell>{user.ownerEmail}</TableCell>
                <TableCell>
                  <AllowedSendersCell
                    email={user.email}
                    senders={user.allowedSenders}
                  >
                    {user.allowedSenders.length === 0 ? (
                      <Badge variant="secondary">All senders</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.allowedSenders.map((s) => (
                          <Badge key={s} variant="outline">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </AllowedSendersCell>
                </TableCell>
                <EmailRowActions email={user.email} enabled={user.enabled} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
