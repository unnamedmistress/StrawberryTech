import type { NextApiRequest, NextApiResponse } from 'next';
import { DataverseRepositoryFactory } from '../../services/DataverseRepositories';

interface PurgeResult {
  success: boolean;
  totalPurged: number;
  details: {
    conversations: number;
    messages: number;
    attachments: number;
    meetings: number;
    exports: number;
    auditLogs: number;
  };
  error?: string;
}

/**
 * Scheduled data purge API endpoint
 * Implements 30-day data retention policy for all Dataverse entities
 * Should be called by a scheduled Power Platform flow
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurgeResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      totalPurged: 0,
      details: {
        conversations: 0,
        messages: 0,
        attachments: 0,
        meetings: 0,
        exports: 0,
        auditLogs: 0
      },
      error: 'Method not allowed'
    });
  }

  try {
    // Validate authorization (should come from Power Platform flow)
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        totalPurged: 0,
        details: {
          conversations: 0,
          messages: 0,
          attachments: 0,
          meetings: 0,
          exports: 0,
          auditLogs: 0
        },
        error: 'Unauthorized - missing or invalid auth token'
      });
    }

    // TODO: Validate the token against Power Platform
    const expectedToken = process.env.PURGE_API_TOKEN;
    if (!expectedToken || authToken !== `Bearer ${expectedToken}`) {
      return res.status(401).json({
        success: false,
        totalPurged: 0,
        details: {
          conversations: 0,
          messages: 0,
          attachments: 0,
          meetings: 0,
          exports: 0,
          auditLogs: 0
        },
        error: 'Unauthorized - invalid token'
      });
    }

    const retentionDays = 30; // Mandated 30-day retention
    const results = {
      conversations: 0,
      messages: 0,
      attachments: 0,
      meetings: 0,
      exports: 0,
      auditLogs: 0
    };

    // Get repository instances
    const conversationRepo = DataverseRepositoryFactory.getConversationRepository();
    const messageRepo = DataverseRepositoryFactory.getMessageRepository();
    const attachmentRepo = DataverseRepositoryFactory.getAttachmentRepository();
    const meetingRepo = DataverseRepositoryFactory.getMeetingRepository();
    const exportRepo = DataverseRepositoryFactory.getExportRepository();
    const auditRepo = DataverseRepositoryFactory.getAuditRepository();

    // Purge data older than 30 days from each repository
    console.log(`Starting data purge for records older than ${retentionDays} days...`);

    // Purge export artifacts first (they may reference other entities)
    results.exports = await exportRepo.purgeOlderThan(retentionDays);
    console.log(`Purged ${results.exports} export artifacts`);

    // Purge attachments next
    results.attachments = await attachmentRepo.purgeOlderThan(retentionDays);
    console.log(`Purged ${results.attachments} attachment links`);

    // Purge messages
    results.messages = await messageRepo.purgeOlderThan(retentionDays);
    console.log(`Purged ${results.messages} messages`);

    // Purge meeting contexts
    results.meetings = await meetingRepo.purgeOlderThan(retentionDays);
    console.log(`Purged ${results.meetings} meeting contexts`);

    // Purge conversations (should be done after messages and attachments)
    results.conversations = await conversationRepo.purgeOlderThan(retentionDays);
    console.log(`Purged ${results.conversations} conversations`);

    // Purge audit logs older than 90 days (longer retention for audit purposes)
    results.auditLogs = await auditRepo.purgeOlderThan(90);
    console.log(`Purged ${results.auditLogs} audit logs`);

    const totalPurged = Object.values(results).reduce((sum, count) => sum + count, 0);

    // Log the purge operation
    await auditRepo.create({
      entityType: 'system',
      entityId: 'data_purge',
      action: 'delete',
      userId: 'system',
      details: JSON.stringify({
        purgeType: 'scheduled_30_day',
        retentionDays,
        results,
        totalPurged,
        timestamp: new Date().toISOString()
      }),
      createdBy: 'system'
    });

    console.log(`Data purge completed. Total records purged: ${totalPurged}`);

    return res.status(200).json({
      success: true,
      totalPurged,
      details: results
    });

  } catch (error) {
    console.error('Data purge failed:', error);
    
    // Log the failure
    try {
      const auditRepo = DataverseRepositoryFactory.getAuditRepository();
      await auditRepo.create({
        entityType: 'system',
        entityId: 'data_purge',
        action: 'delete',
        userId: 'system',
        details: JSON.stringify({
          purgeType: 'scheduled_30_day',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }),
        createdBy: 'system'
      });
    } catch (auditError) {
      console.error('Failed to log purge failure:', auditError);
    }

    return res.status(500).json({
      success: false,
      totalPurged: 0,
      details: {
        conversations: 0,
        messages: 0,
        attachments: 0,
        meetings: 0,
        exports: 0,
        auditLogs: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred during purge'
    });
  }
}